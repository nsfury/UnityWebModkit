import { LogLevel, Logger } from "../logger";
import { WebData } from "../web-data";
import { version } from "../mod";

const logger = new Logger("Preloader");

export function preload(): Promise<WebData> {
  logger.info("UnityWebModkit v%s - %s", version, window.location.hostname);
  // @ts-ignore Set by webpack at bundle time
  logger.info("Build hash: %s", __webpack_hash__);
  return loadWebData();
}

function loadWebData(): Promise<WebData> {
  logger.debug("Trying to load Unity web data from indexedDB cache");
  return new Promise<WebData>((resolve) => {
    indexedDB.databases().then(async (databases) => {
      const unityCache = databases.findIndex((d) => d.name === "UnityCache");
      if (unityCache == -1) {
        resolve(await fallbackInterceptFetch());
        return;
      }

      const request = window.indexedDB.open("UnityCache", 3);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const requestCacheEntries = db
          .transaction(["RequestStore"], "readonly")
          .objectStore("RequestStore")
          .getAll();
        requestCacheEntries.onsuccess = async (event: any) => {
          const entries = event.target.result;
          if (entries.length === 0) {
            resolve(await fallbackInterceptFetch());
            return;
          }
          resolve(parseWebData(entries[0].response.parsedBody.buffer));
        };
        requestCacheEntries.onerror = async () => {
          db.close();
          resolve(await fallbackInterceptFetch());
        };
      };
    });
  });
}

async function fallbackInterceptFetch(): Promise<WebData> {
  logger.debug("Nothing in indexedDB cache, resorting to hooking Fetch API");
  return new Promise<WebData>((resolve) => {
    const originalFetch = window.fetch;
    window.fetch = async function (url) {
      if ((url as string).includes("webgl.data.br")) {
        window.fetch = originalFetch;
        const response = await originalFetch.apply(this, arguments as any);
        resolve(parseWebData(await response.clone().arrayBuffer()));
        return response;
      }
      return originalFetch.apply(this, arguments as any);
    };
  });
}

function parseWebData(data: ArrayBuffer): WebData {
  return new WebData(data, [
    ["data.unity3d", 32],
    ["Il2CppData/Metadata/global-metadata.dat"],
  ]);
}
