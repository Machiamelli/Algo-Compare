const path = require("path");
const { getJavaClassName, renameJavaFile } = require("../utils/index.cjs");
const { registerProcess, unregisterProcess } = require("../utils/index.cjs");
const { exec } = require("child_process");

/**
 * Custom execAsync that registers the process for tracking
 */
function execAsync(command) {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      unregisterProcess(child);
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
    registerProcess(child);
  });
}

/**
 * Compile C++ file
 */
async function compileCpp(sourceFile, compilerPath, outputFile) {
  try {
    const command = `"${compilerPath}" "${sourceFile}" -o "${outputFile}" -std=c++17`;

    const { stdout, stderr } = await execAsync(command);

    return {
      success: true,
      executable: outputFile,
      output: stdout || stderr,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr || "",
    };
  }
}

/**
 * Compile Java file (with auto-rename based on class name)
 */
async function compileJava(sourceFile, javacPath) {
  try {
    // Step 1: Extract class name from source
    const classResult = await getJavaClassName(sourceFile);

    if (!classResult.success) {
      return {
        success: false,
        error: "Failed to extract Java class name: " + classResult.error,
      };
    }

    const className = classResult.className;

    // Step 2: Rename file to match class name (Option A)
    const renameResult = await renameJavaFile(sourceFile, className);

    if (!renameResult.success) {
      return {
        success: false,
        error: "Failed to rename Java file: " + renameResult.error,
      };
    }

    const renamedPath = renameResult.path;
    const outputDir = path.dirname(renamedPath);

    // Step 3: Compile
    const command = `"${javacPath}" -d "${outputDir}" "${renamedPath}"`;

    const { stdout, stderr } = await execAsync(command);

    return {
      success: true,
      className,
      classPath: outputDir,
      sourceFile: renamedPath,
      output: stdout || stderr,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr || "",
    };
  }
}

/**
 * Main compile function that routes to language-specific compiler
 */
async function compile(sourceFile, language, compilerInfo) {
  if (language === "cpp") {
    const outputFile = sourceFile.replace(
      /\.(cpp|cc|cxx)$/,
      process.platform === "win32" ? ".exe" : "",
    );
    return await compileCpp(sourceFile, compilerInfo.path, outputFile);
  } else if (language === "java") {
    return await compileJava(sourceFile, compilerInfo.javacPath);
  } else if (language === "python") {
    // Python doesn't need compilation
    return {
      success: true,
      sourceFile,
      message: "Python does not require compilation",
    };
  } else {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }
}

module.exports = {
  compile,
};
