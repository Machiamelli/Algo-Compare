const compiler = require("./compiler.cjs");
const runner = require("./runner.cjs");
const modeRunners = require("./modeRunners.cjs");

module.exports = {
    ...compiler,
    ...runner,
    ...modeRunners,
};
