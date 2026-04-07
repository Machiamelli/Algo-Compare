const {
  detectCompilers,
  getPreferredCompilers,
  refreshDetection,
} = require("../detection/index.cjs");

/**
 * Build standardized compiler response object
 */
function buildCompilerResponse(detection) {
  return {
    all: detection,
    preferred: getPreferredCompilers(detection),
  };
}

/**
 * Wrap handler logic with consistent error handling
 */
async function withErrorHandling(fn) {
  try {
    const detection = await fn();
    return {
      success: true,
      data: buildCompilerResponse(detection),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get compiler status (always fresh, no caching)
 */
async function handleGetCompilerStatus() {
  return withErrorHandling(() => detectCompilers());
}

/**
 * Force refresh compiler detection
 */
async function handleRefreshCompilers() {
  return withErrorHandling(() => refreshDetection());
}

module.exports = {
  handleGetCompilerStatus,
  handleRefreshCompilers,
};
