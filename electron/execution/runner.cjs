const { spawn } = require("child_process");
const path = require("path");
const { EXECUTION_RESULTS } = require("../constants/index.cjs");
const { registerProcess, unregisterProcess } = require("../utils/index.cjs");

/**
 * Shell-escape a single argument for safe embedding in a bash -c string.
 * Wraps in single quotes and escapes any embedded single quotes.
 */
function shellEscape(arg) {
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

function buildCommand(command, args) {
  if (process.platform === "win32") {
    return { command, args };
  }

  const escaped = [command, ...args].map(shellEscape).join(" ");
  return {
    command: "/bin/bash",
    args: ["-c", `ulimit -s unlimited 2>/dev/null; exec ${escaped}`],
  };
}

/**
 * Run a compiled/interpreted program with input and timeout
 */
async function runProgram(config) {
  const {
    language,
    executable, // For C++ (path to .exe)
    sourceFile, // For Python/Java (path to source)
    className, // For Java (class name)
    classPath, // For Java (directory containing .class)
    input, // Input string to send to stdin
    timeLimit, // Time limit in milliseconds (null = no limit)
    runtimePath, // Compiler/interpreter path
  } = config;

  return new Promise((resolve) => {
    let command;
    let args = [];

    // Determine command based on language
    if (language === "cpp") {
      command = executable;
      args = [];
    } else if (language === "python") {
      command = runtimePath; // python3 path
      args = [sourceFile];
    } else if (language === "java") {
      command = runtimePath; // java path
      args = ["-cp", classPath, className];
    } else {
      resolve({
        success: false,
        error: `Unsupported language: ${language}`,
        errorType: "UNSUPPORTED",
      });
      return;
    }

    const startTime = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killed = false;

    // Wrap command with unlimited stack size on Unix systems
    const built = buildCommand(command, args);

    const child = spawn(built.command, built.args, {
      timeout: timeLimit || 0, // 0 = no timeout
      detached: process.platform !== "win32", // Create process group on Unix
    });

    registerProcess(child);

    // Handle stdin errors (broken pipe when process crashes immediately)
    child.stdin.on("error", () => {
      // Intentionally ignored - we'll get the real error from child events
    });

    // Set up timeout if specified
    let timeoutId = null;
    if (timeLimit) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        try {
          // Kill the entire process group on Unix
          process.kill(-child.pid, "SIGTERM");
        } catch {
          child.kill("SIGTERM");
        }

        // Force kill after 1 second if still running
        setTimeout(() => {
          if (!killed) {
            try {
              process.kill(-child.pid, "SIGKILL");
            } catch {
              child.kill("SIGKILL");
            }
          }
        }, 1000);
      }, timeLimit);
    }

    // Write input to stdin
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    // Capture stdout
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // Capture stderr
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Handle process exit
    child.on("close", (code) => {
      unregisterProcess(child);
      killed = true;
      if (timeoutId) clearTimeout(timeoutId);

      const executionTime = Date.now() - startTime;

      if (timedOut) {
        resolve({
          success: false,
          error: `Time Limit Exceeded (${timeLimit}ms)`,
          errorType: EXECUTION_RESULTS.TLE,
          executionTime,
        });
      } else if (code !== 0) {
        resolve({
          success: false,
          error: stderr || `Process exited with code ${code}`,
          stderr: stderr,
          errorType: EXECUTION_RESULTS.RUNTIME_ERROR,
          executionTime,
          exitCode: code,
        });
      } else {
        resolve({
          success: true,
          output: stdout,
          executionTime,
        });
      }
    });

    // Handle spawn errors
    child.on("error", (error) => {
      unregisterProcess(child);
      killed = true;
      if (timeoutId) clearTimeout(timeoutId);

      resolve({
        success: false,
        error: error.message,
        stderr: error.message,
        errorType: EXECUTION_RESULTS.RUNTIME_ERROR,
        exitCode: -1,
      });
    });
  });
}

/**
 * Run both solutions and compare outputs
 */
async function runComparison(slotAConfig, slotBConfig, input) {
  // Run Slot A (Brute Force - no time limit)
  const slotAResult = await runProgram({
    ...slotAConfig,
    input,
    timeLimit: null, // No limit for brute force
  });

  // If Slot A failed
  if (!slotAResult.success) {
    return {
      success: false,
      type:
        slotAResult.errorType === EXECUTION_RESULTS.TLE
          ? EXECUTION_RESULTS.TLE
          : EXECUTION_RESULTS.RUNTIME_ERROR,
      failedSlot: "A",
      slotAResult,
      input,
    };
  }

  // Run Slot B (Tested - with time limit)
  const slotBResult = await runProgram({
    ...slotBConfig,
    input,
    timeLimit: slotBConfig.timeLimit,
  });

  // If Slot B failed (TLE or Runtime Error)
  if (!slotBResult.success) {
    return {
      success: false,
      type: slotBResult.errorType,
      failedSlot: "B",
      slotAResult,
      slotBResult,
      input,
    };
  }

  // Both succeeded - compare outputs
  const { compareOutputs } = require("../utils/index.cjs");
  const match = compareOutputs(slotAResult.output, slotBResult.output);

  if (!match) {
    return {
      success: false,
      type: EXECUTION_RESULTS.MISMATCH,
      slotAResult,
      slotBResult,
      input,
    };
  }

  // Outputs match
  return {
    success: true,
    slotAResult,
    slotBResult,
    input,
  };
}

module.exports = {
  runProgram,
  runComparison,
};
