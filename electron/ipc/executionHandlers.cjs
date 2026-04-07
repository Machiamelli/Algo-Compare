const {
  detectCompilers,
  getPreferredCompilers,
} = require("../detection/index.cjs");
const { EXECUTION_RESULTS } = require("../constants/index.cjs");
const {
  compile,
  runStaticMode,
  runGeneratorMode,
} = require("../execution/index.cjs");
const {
  getUploadedFiles,
  getIsRunning,
  setIsRunning,
  getStopRequested,
  setStopRequested,
  resetExecutionFlags,
} = require("../utils/index.cjs");

/**
 * Slot configuration definitions
 */
const SLOT_CONFIGS = {
  A: {
    label: "A",
    storeKey: "slotA",
    fileKey: "bruteForce",
    displayName: "brute force solution",
    getTimeLimit: () => null,
  },
  B: {
    label: "B",
    storeKey: "slotB",
    fileKey: "testedSolution",
    displayName: "untested solution",
    getTimeLimit: (configTimeLimit) => configTimeLimit ?? 2000,
  },
};

/**
 * Mode executors mapping
 */
const MODE_EXECUTORS = {
  static: runStaticMode,
  generator: runGeneratorMode,
};

/**
 * Send progress event safely (window might be closed)
 */
function sendProgress(event, data) {
  try {
    event.sender.send("comparison-progress", data);
  } catch {
    // Window might be closed, ignore
  }
}

/**
 * Create compilation error response
 */
function createCompilationError(slot, compileResult) {
  return {
    success: false,
    failureType: EXECUTION_RESULTS.COMPILATION_ERROR,
    failedSlot: slot,
    error: compileResult.error || "Compilation failed",
    stderr:
      compileResult.stderr ||
      compileResult.error ||
      "No compilation output available",
    totalTests: 0,
    testsPassed: 0,
  };
}

/**
 * Build runtime config for a slot
 */
function buildRuntimeConfig(
  language,
  compileResult,
  uploadedFile,
  compilerInfo,
  timeLimit,
) {
  return {
    language,
    executable: compileResult.executable,
    sourceFile: compileResult.sourceFile || uploadedFile.path,
    className: compileResult.className,
    classPath: compileResult.classPath,
    runtimePath:
      language === "python" ? compilerInfo.path : compilerInfo.javaPath,
    ...(timeLimit !== null && { timeLimit }),
  };
}

function validateUploadedFiles(uploadedFiles) {
  const requiredKeys = ["testedSolution", "bruteForce", "testCases"];
  const allPresent = requiredKeys.every((key) => uploadedFiles[key]);

  return allPresent
    ? { valid: true }
    : {
        valid: false,
        error: {
          success: false,
          failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
          error: "All 3 files must be uploaded",
          totalTests: 0,
          testsPassed: 0,
        },
      };
}

/**
 * Prepare a single slot: get compiler, compile, and build runtime config
 */
async function prepareSlot(
  event,
  slotConfig,
  uploadedFiles,
  preferred,
  timeLimit,
) {
  const uploadedFile = uploadedFiles[slotConfig.fileKey];
  const { language } = uploadedFile;

  // Get compiler
  const compilerInfo = preferred[language];
  if (!compilerInfo) {
    return {
      success: false,
      error: {
        success: false,
        failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
        failedSlot: slotConfig.label,
        error: `No ${language} compiler/runtime detected for ${slotConfig.displayName}`,
        totalTests: 0,
        testsPassed: 0,
      },
    };
  }

  // Compile
  sendProgress(event, { stage: "compiling", slot: slotConfig.label });
  const compileResult = await compile(
    uploadedFile.path,
    language,
    compilerInfo,
  );

  if (!compileResult.success) {
    return {
      success: false,
      error: createCompilationError(slotConfig.label, compileResult),
    };
  }

  // Build runtime config
  const runtimeConfig = buildRuntimeConfig(
    language,
    compileResult,
    uploadedFile,
    compilerInfo,
    slotConfig.getTimeLimit(timeLimit),
  );

  return { success: true, runtimeConfig };
}

/**
 * Prepare all slots for comparison
 */
async function prepareAllSlots(event, uploadedFiles, preferred, timeLimit) {
  const configs = {};

  for (const [key, slotConfig] of Object.entries(SLOT_CONFIGS)) {
    const result = await prepareSlot(
      event,
      slotConfig,
      uploadedFiles,
      preferred,
      timeLimit,
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    configs[key] = result.runtimeConfig;
  }

  return { success: true, configs };
}

/**
 * Start comparison execution
 */
async function handleStartComparison(event, config) {
  if (getIsRunning()) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
      error: "Comparison already running",
      stderr: "Comparison already running",
      totalTests: 0,
      testsPassed: 0,
    };
  }

  setIsRunning(true);
  setStopRequested(false);

  try {
    const { timeLimit, mode } = config;
    const uploadedFiles = getUploadedFiles();

    // Validate files
    const validation = validateUploadedFiles(uploadedFiles);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get compilers
    const detection = await detectCompilers();
    const preferred = getPreferredCompilers(detection);

    const preparation = await prepareAllSlots(
      event,
      uploadedFiles,
      preferred,
      timeLimit,
    );
    if (!preparation.success) {
      if (getStopRequested()) {
        return {
          success: true,
          totalTests: 0,
          testsPassed: 0,
          stopped: true,
        };
      }
      return preparation.error;
    }

    // Execute based on mode
    const executor = MODE_EXECUTORS[mode];
    if (!executor) {
      return { success: false, error: `Unknown mode: ${mode}` };
    }

    const args = [
      event,
      preparation.configs.A,
      preparation.configs.B,
      uploadedFiles.testCases,
    ];
    if (mode === "generator") {
      args.push(preferred);
    }

    return await executor(...args);
  } catch (error) {
    return {
      success: false,
      failureType: EXECUTION_RESULTS.RUNTIME_ERROR,
      error: error.message,
      stderr: error.message,
      totalTests: 0,
      testsPassed: 0,
    };
  } finally {
    resetExecutionFlags();
  }
}

/**
 * Stop comparison execution
 */
async function handleStopComparison() {
  const { killAllProcesses } = require("../utils/index.cjs");
  setStopRequested(true);
  setIsRunning(false);
  killAllProcesses();
  return { success: true };
}

module.exports = {
  handleStartComparison,
  handleStopComparison,
};
