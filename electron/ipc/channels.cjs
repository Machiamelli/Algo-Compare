const CHANNELS = {
  COMPILER: {
    GET_STATUS: "get-compiler-status",
    REFRESH: "refresh-compilers",
  },
  FILE: {
    READ: "read-file",
    SAVE_EDITED: "save-edited-file",
    OPEN_DIALOG: "open-file-dialog",
  },
  EXECUTION: {
    START_COMPARISON: "start-comparison",
    STOP_COMPARISON: "stop-comparison",
    PROGRESS: "comparison-progress",
  },
};

module.exports = CHANNELS;
