/**
 * Centralized state management for execution flow
 */

let uploadedFiles = {
  testedSolution: null,
  bruteForce: null,
  testCases: null,
};

let isRunning = false;
let stopRequested = false;
const runningProcesses = new Set();

// ========== Uploaded Files State ==========
function getUploadedFiles() {
  return uploadedFiles;
}

function setUploadedFile(slot, data) {
  uploadedFiles[slot] = data;
}

// ========== Execution Flags ==========
function getIsRunning() {
  return isRunning;
}

function setIsRunning(value) {
  isRunning = value;
}

function getStopRequested() {
  return stopRequested;
}

function setStopRequested(value) {
  stopRequested = value;
}

function resetExecutionFlags() {
  isRunning = false;
  stopRequested = false;
}

// ========== Process Tracking ==========
function registerProcess(child) {
  if (child && child.pid) {
    runningProcesses.add(child);
    child.on("exit", () => {
      runningProcesses.delete(child);
    });
  }
}

function unregisterProcess(child) {
  runningProcesses.delete(child);
}

function killAllProcesses() {
  for (const child of runningProcesses) {
    try {
      if (!child.killed) {
        if (process.platform !== "win32" && child.pid) {
          // Kill entire process group on Unix (negative PID)
          process.kill(-child.pid, "SIGKILL");
        } else {
          child.kill("SIGKILL");
        }
      }
    } catch (err) {
      // Process may have already exited
      try {
        child.kill("SIGKILL");
      } catch {
        // Already dead
      }
    }
  }
  runningProcesses.clear();
}

module.exports = {
  // Uploaded files
  getUploadedFiles,
  setUploadedFile,

  // Execution flags
  getIsRunning,
  setIsRunning,
  getStopRequested,
  setStopRequested,
  resetExecutionFlags,

  // Process tracking
  registerProcess,
  unregisterProcess,
  killAllProcesses,
};
