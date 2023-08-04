import { LogLevel, Logger } from "../logger";
import { version } from "../runtime";
const logger = new Logger("Preloader", LogLevel.INFO);
export function preload() {
    if (typeof window === "undefined") {
        console.log("\x1b[37m[UnityWebModkit]\x1b[0m \x1b[33m[WARN]\x1b[0m Not running in a browser environment! Nothing will be executed.");
        return;
    }
    logger.info("UnityWebModkit v%s - %s", version, window.location.hostname);
    // @ts-ignore Set by webpack at bundle time
    logger.info("Build hash: %s", __webpack_hash__);
}
//# sourceMappingURL=index.js.map