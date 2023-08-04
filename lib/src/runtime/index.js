"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logger_1 = require("../logger");
exports.logger = new logger_1.Logger('UnityWebModkit', logger_1.LogLevel.INFO |
    logger_1.LogLevel.DEBUG |
    logger_1.LogLevel.WARN |
    logger_1.LogLevel.ERROR |
    logger_1.LogLevel.MESSAGE);
//# sourceMappingURL=index.js.map