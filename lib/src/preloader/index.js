"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = void 0;
const logger_1 = require("../logger");
const package_json_1 = require("../../package.json");
const logger = new logger_1.Logger('Preloader', logger_1.LogLevel.INFO);
function preload() {
    if (typeof window === 'undefined') {
        console.log('\x1b[37m[UnityWebModkit]\x1b[0m \x1b[33m[WARN]\x1b[0m Not running in a browser environment! Nothing will be executed.');
        return;
    }
    logger.info('UnityWebModkit v%s - %s', package_json_1.version, window.location.hostname);
}
exports.preload = preload;
//# sourceMappingURL=index.js.map