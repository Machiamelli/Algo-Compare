const fs = require("fs").promises;
const { compile } = require("./compiler.cjs");
const { runComparison, runProgram } = require("./runner.cjs");
const {
  streamParseTestCases,
  countTestCases,
  getStopRequested,
} = require("../utils/index.cjs");
const { EXECUTION_RESULTS } = require("../constants/index.cjs");

/**
 * Handle comparison error and build appropriate error result
 */
function handleComparisonError(
  result,
  testCase,
  input,
  totalTests,
  testsPassed,
) {
  if (result.type === EXECUTION_RESULTS.RUNTIME_ERROR) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
      testCase,
      input,
      error:
        result.failedSlot === "A"
          ? result.slotAResult.error
          : result.slotBResult.error,
      stderr:
        result.failedSlot === "A"
          ? result.slotAResult.stderr
          : result.slotBResult.stderr,
      exitCode:
        result.failedSlot === "A"
          ? result.slotAResult.exitCode
          : result.slotBResult.exitCode,
      failedSlot: result.failedSlot,
      totalTests,
      testsPassed,
    };
  } else if (result.type === EXECUTION_RESULTS.TLE) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.TLE,
      testCase,
      input,
      error: result.slotBResult.error,
      failedSlot: result.failedSlot,
      totalTests,
      testsPassed,
    };
  } else if (result.type === EXECUTION_RESULTS.MISMATCH) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.MISMATCH,
      testCase,
      input,
      expectedOutput: result.slotAResult.output,
      actualOutput: result.slotBResult.output,
      totalTests,
      testsPassed,
    };
  }
}

/**
 * Run in static mode (test cases from file)
 * Uses an async generator so only one test case string lives in memory at a time.
 */
async function runStaticMode(event, slotAConfig, slotBConfig, testCasesFile) {
  // Quick first pass: count test cases for the progress bar
  const totalTests = await countTestCases(testCasesFile.path);

  if (totalTests === 0) {
    return {
      success: false,
      error: "No test cases found in input file",
    };
  }

  // Report initial progress
  event.sender.send("comparison-progress", {
    stage: "Running Comparison...",
    current: 0,
    total: totalTests,
    mode: "static",
  });

  // Stream test cases one at a time — only the current test case is in RAM
  let i = 0;
  for await (const testCase of streamParseTestCases(testCasesFile.path)) {
    if (getStopRequested()) {
      return {
        success: true,
        totalTests: i,
        testsPassed: i,
        stopped: true,
      };
    }

    i++;

    event.sender.send("comparison-progress", {
      stage: "Running Comparison...",
      current: i,
      total: totalTests,
      mode: "static",
    });

    const result = await runComparison(slotAConfig, slotBConfig, testCase);

    if (!result.success) {
      if (getStopRequested()) {
        return {
          success: true,
          totalTests: i - 1,
          testsPassed: i - 1,
          stopped: true,
        };
      }
      return handleComparisonError(result, i, testCase, totalTests, i - 1);
    }
  }

  // All tests passed
  return {
    success: true,
    totalTests: i,
    testsPassed: i,
  };
}

/**
 * Run in generator mode (generate test cases on the fly)
 */
async function runGeneratorMode(
  event,
  slotAConfig,
  slotBConfig,
  generatorFile,
  preferred,
) {
  const generatorLanguage = generatorFile.language;

  if (!generatorLanguage) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
      failedSlot: "generator",
      error: "Generator file must be a .cpp, .java, or .py file",
    };
  }

  const compilerInfo = preferred[generatorLanguage];

  if (!compilerInfo) {
    return {
      success: false,
      error: `No compiler found for ${generatorLanguage}`,
    };
  }

  // Compile generator
  event.sender.send("comparison-progress", {
    stage: "Compiling Generator...",
    slot: "generator",
    mode: "generator",
  });
  const compileGen = await compile(
    generatorFile.path,
    generatorLanguage,
    compilerInfo,
  );

  if (!compileGen.success) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.COMPILATION_ERROR,
      failedSlot: "generator",
      error: compileGen.error,
      stderr: compileGen.error,
    };
  }

  const generatorConfig = {
    language: generatorLanguage,
    executable: compileGen.executable,
    sourceFile: compileGen.sourceFile || generatorFile.path,
    className: compileGen.className,
    classPath: compileGen.classPath,
    runtimePath:
      generatorLanguage === "python"
        ? compilerInfo.path
        : compilerInfo.javaPath,
  };

  // Run indefinitely until failure or stop
  event.sender.send("comparison-progress", {
    stage: "Running Comparison...",
    mode: "generator",
  });

  let testCount = 0;

  while (!getStopRequested()) {
    testCount++;

    event.sender.send("comparison-progress", {
      stage: "Running Comparison...",
      current: testCount,
      mode: "generator",
    });

    // Generate test input
    const genResult = await runProgram({
      ...generatorConfig,
      input: "",
      timeLimit: null, // No timeout for generator
    });

    if (!genResult.success) {
      // Check if stop was requested - process might have been killed
      if (getStopRequested()) {
        return {
          success: true,
          totalTests: testCount - 1,
          testsPassed: testCount - 1,
          stopped: true,
        };
      }
      // Generator actually failed
      return {
        success: false,
        failureType:
          genResult.errorType === EXECUTION_RESULTS.TLE
            ? EXECUTION_RESULTS.TLE
            : EXECUTION_RESULTS.RUNTIME_ERROR,
        failedSlot: "generator",
        testCase: testCount,
        error: genResult.error,
        stderr: genResult.stderr || genResult.error,
        exitCode: genResult.exitCode,
        totalTests: testCount,
        testsPassed: testCount - 1,
      };
    }

    const generatedInput = genResult.output;

    // Check stop before running comparison (in case it was set during generator)
    if (getStopRequested()) {
      return {
        success: true,
        totalTests: testCount - 1,
        testsPassed: testCount - 1,
        stopped: true,
      };
    }

    // Run comparison with generated input
    const result = await runComparison(
      slotAConfig,
      slotBConfig,
      generatedInput,
    );

    if (!result.success) {
      // Check stop again - process might have been killed during comparison
      if (getStopRequested()) {
        return {
          success: true,
          totalTests: testCount - 1,
          testsPassed: testCount - 1,
          stopped: true,
        };
      }
      return handleComparisonError(
        result,
        testCount,
        generatedInput,
        testCount,
        testCount - 1,
      );
    }

    event.sender.send("comparison-progress", {
      stage: "passed",
      testCase: testCount,
      mode: "generator",
    });
  }

  // Stopped by user
  return {
    success: true, // Treat as success to show results
    totalTests: testCount,
    testsPassed: testCount,
    stopped: true,
  };
}

module.exports = {
  runStaticMode,
  runGeneratorMode,
};
