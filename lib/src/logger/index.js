"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 4] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 8] = "DEBUG";
    LogLevel[LogLevel["MESSAGE"] = 16] = "MESSAGE";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor(name, logLevel = LogLevel.INFO | LogLevel.ERROR) {
        this.name = name;
        this.logLevel = logLevel;
    }
    log(level, ...args) {
        if (this.shouldLog(level) && args.length > 0) {
            const logPrefix = `%c[${this.name}] %c[${LogLevel[level]}] %c`;
            const message = args.shift();
            let logStyles = 'color: #fff;';
            let messageStyles;
            switch (level) {
                case LogLevel.ERROR:
                    messageStyles = 'color: #FF6E74;';
                    break;
                case LogLevel.WARN:
                    messageStyles = 'color: #FFB36A;';
                    break;
                case LogLevel.INFO:
                    messageStyles = 'color: #35EA93;';
                    break;
                case LogLevel.DEBUG:
                    messageStyles = 'color: #BE7CFF;';
                    break;
                case LogLevel.MESSAGE:
                    messageStyles = 'color: #56C4FF;';
                    break;
            }
            console.log(logPrefix + message, logStyles, messageStyles, 'color: default;', ...args);
        }
    }
    shouldLog(level) {
        return (this.logLevel & level) !== 0;
    }
    setLogLevel(logLevel) {
        this.logLevel = logLevel;
    }
    error(...args) {
        this.log(LogLevel.ERROR, ...args);
    }
    warn(...args) {
        this.log(LogLevel.WARN, ...args);
    }
    info(...args) {
        this.log(LogLevel.INFO, ...args);
    }
    debug(...args) {
        this.log(LogLevel.DEBUG, ...args);
    }
    message(...args) {
        this.log(LogLevel.MESSAGE, ...args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map