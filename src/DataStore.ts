import localForage from "localforage";
import clientCache from "./ClientCache";
import { isBrowser } from "./utils";

/**
 * Internal function to get or create a localForage instance
 * @private
 * @param {LocalForageOptions} config - Configuration options for localForage
 * @param {boolean} capture - If true, returns the default localForage instance when no cached instance exists
 * @returns {LocalForage | undefined} The localForage instance or undefined if not in browser environment
 */
function _dataStore(
  config: LocalForageOptions = {},
  capture: boolean,
): LocalForage | undefined {
  // Check if code is running in browser environment
  if (!isBrowser) {
    return;
  }

  // Create a unique key for the config
  const configString = JSON.stringify(config);

  // Try to get existing instance from cache
  let client = clientCache.getCache(configString);

  // If no cached instance and capture is true, use default localForage instance
  if (!client && capture) {
    client = localForage;
  }

  return client;
}

/**
 * Drops (removes) a localForage instance and cleans up associated cache
 * @param {LocalForageOptions} config - Configuration options for the instance to drop
 * @param {boolean} [capture=false] - If true, affects the default localForage instance when no cached instance exists
 * @returns {void}
 */
export function dropDataStore(
  config: LocalForageOptions = {},
  capture: boolean = false,
): void {
  const client = _dataStore(config, capture);
  const configString = JSON.stringify(config);

  // Drop the localForage instance if it exists
  client?.dropInstance();
  // Remove the instance from our cache
  clientCache?.removeCache(configString);
}

/**
 * Removes all items from a localForage instance
 * @param {LocalForageOptions} config - Configuration options for the instance to clear
 * @param {boolean} [capture=false] - If true, affects the default localForage instance when no cached instance exists
 * @returns {void}
 */
export function removeDataStoreItems(
  config: LocalForageOptions = {},
  capture: boolean = false,
): void {
  const client = _dataStore(config, capture);

  // Clear all items and refresh cache when complete
  client?.clear().then(() => {
    clientCache.refleshCache();
  });
}

/**
 * Available storage drivers for localForage
 * @type {Object}
 * @property {string} WEBSQL - WebSQL driver
 * @property {string} INDEXEDDB - IndexedDB driver
 * @property {string} LOCALSTORAGE - localStorage driver
 */
export const DRIVER = {
  WEBSQL: localForage.WEBSQL,
  INDEXEDDB: localForage.INDEXEDDB,
  LOCALSTORAGE: localForage.LOCALSTORAGE,
};
