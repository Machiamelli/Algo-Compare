const { detectPython } = require("./languages/python.cjs");
const { detectJava } = require("./languages/java.cjs");
const { detectCpp } = require("./languages/cpp.cjs");

/**
 * Detect all compilers/interpreters
 * @returns {Promise<{python: Array, java: Array, cpp: Array}>}
 */
async function detectAll() {
  const [python, java, cpp] = await Promise.all([
    detectPython(),
    detectJava(),
    detectCpp(),
  ]);

  return { python, java, cpp };
}

/**
 * Get preferred compiler for each language (first detected)
 */
function getPreferredCompilers(detectionResult) {
  return {
    cpp: detectionResult.cpp[0] || null,
    java: detectionResult.java[0] || null,
    python: detectionResult.python[0] || null,
  };
}

module.exports = {
  detectAll,
  detectCompilers: detectAll,
  refreshDetection: detectAll,
  getPreferredCompilers,
};
