const parser = require("./parser.cjs");
const paths = require("./paths.cjs");
const fileManager = require("./fileManager.cjs");
const executionState = require("./executionState.cjs");

module.exports = {
    ...parser,
    ...paths,
    ...fileManager,
    ...executionState,
};
