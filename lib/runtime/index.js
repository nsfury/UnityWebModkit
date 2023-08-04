import { Logger } from "../logger";
import { preload } from "../preloader";
// @ts-ignore Set by webpack at bundle time
export const version = VERSION;
export class Runtime {
    static initialize() {
        if (Runtime.startedInitializing)
            return;
        Runtime.startedInitializing = true;
        preload();
    }
    static setGlobalLogLevel(level) {
        Logger.globalLogLevel = level;
    }
}
Runtime.startedInitializing = false;
//# sourceMappingURL=index.js.map