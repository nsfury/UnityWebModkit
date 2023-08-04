"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const runtime_1 = require("../runtime");
function bootstrap() {
    if (typeof window === "undefined") {
        console.log("\x1b[37m[UnityWebModkit]\x1b[0m \x1b[33m[WARN]\x1b[0m Not running in a browser environment! Nothing will be executed.");
        return;
    }
    runtime_1.Runtime.logger.info("Bootstrapping page...");
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=index.js.map