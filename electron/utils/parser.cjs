const fs = require("fs").promises;
const { createReadStream } = require("fs");
const readline = require("readline");

/**
 * Extract public class name from Java source code
 */
function extractJavaClassName(sourceCode) {
  // Match: public class ClassName
  const publicClassRegex = /public\s+class\s+(\w+)/;
  const match = sourceCode.match(publicClassRegex);

  if (match) {
    return { success: true, className: match[1] };
  }

  // Fallback: If no public class, look for any class with main method
  const classWithMainRegex =
    /class\s+(\w+)[\s\S]*?public\s+static\s+void\s+main/;
  const mainMatch = sourceCode.match(classWithMainRegex);

  if (mainMatch) {
    return { success: true, className: mainMatch[1] };
  }

  return { success: false, error: "No valid class found with main method" };
}

/**
 * Extract class name from Java file
 */
async function getJavaClassName(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return extractJavaClassName(content);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Normalize output for comparison
 * Steps:
 * 1. Split by lines
 * 2. Trim each line
 * 3. Filter out empty lines
 * 4. Join with \n
 */
function normalizeOutput(output) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Compare two outputs after normalization
 */
function compareOutputs(output1, output2) {
  const normalized1 = normalizeOutput(output1);
  const normalized2 = normalizeOutput(output2);

  return normalized1 === normalized2;
}

/**
 * Count the number of test cases in a file without loading them.
 * Does a single fast pass counting delimiters.
 * Returns a Promise that resolves to the count.
 */
function countTestCases(filePath) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let currentSectionHasContent = false;
    const delimiterRegex = /^[-]{3,}$/;

    const rl = readline.createInterface({
      input: createReadStream(filePath, { encoding: "utf-8" }),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      if (delimiterRegex.test(line.trim())) {
        // Delimiter hit — if the section before it had content, that's a test case
        if (currentSectionHasContent) {
          count++;
        }
        currentSectionHasContent = false;
      } else if (line.trim().length > 0) {
        currentSectionHasContent = true;
      }
    });

    rl.on("close", () => {
      // Flush the last section (after the final delimiter, or the whole file
      // if there were no delimiters)
      if (currentSectionHasContent) {
        count++;
      }
      resolve(count);
    });

    rl.on("error", reject);
  });
}

/**
 * Stream-parse static test cases from a file as an async generator.
 * Yields one test case at a time so only a single test case string
 * is ever held in memory — previous ones are eligible for GC immediately.
 *
 * Uses event-based readline instead of `for await...of` on the readline
 * async iterator, which avoids a known Node.js bug where the readline
 * interface can be prematurely closed when the generator is suspended
 * at a `yield` point (ERR_USE_AFTER_CLOSE / "readline was closed").
 */
async function* streamParseTestCases(filePath) {
  const delimiterRegex = /^[-]{3,}$/;
  let currentCase = [];
  const queue = [];
  let finished = false;
  let readlineError = null;
  let wake = null;

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    if (delimiterRegex.test(line.trim())) {
      const tc = currentCase.join("\n").trim();
      if (tc.length > 0) {
        queue.push(tc);
        if (wake) {
          const w = wake;
          wake = null;
          w();
        }
      }
      currentCase = [];
    } else {
      currentCase.push(line);
    }
  });

  rl.on("close", () => {
    const tc = currentCase.join("\n").trim();
    if (tc.length > 0) {
      queue.push(tc);
    }
    finished = true;
    if (wake) {
      const w = wake;
      wake = null;
      w();
    }
  });

  rl.on("error", (err) => {
    readlineError = err;
    finished = true;
    if (wake) {
      const w = wake;
      wake = null;
      w();
    }
  });

  try {
    while (true) {
      while (queue.length > 0) {
        yield queue.shift();
      }
      if (readlineError) throw readlineError;
      if (finished) break;
      await new Promise((r) => {
        wake = r;
      });
    }
    if (readlineError) throw readlineError;
  } finally {
    rl.close();
    stream.destroy();
  }
}

module.exports = {
  getJavaClassName,
  streamParseTestCases,
  countTestCases,
  compareOutputs,
};
