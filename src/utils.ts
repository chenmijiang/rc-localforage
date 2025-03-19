import localForage from "localforage";
import clientCache from "./ClientCache";
import type { LocalForageOptions } from "./type";

/**
 * Check if the code is running in the browser
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Get the localForage instance
 * @param config - The configuration options for localForage
 * @param target - If provided, the target instance will be used, override the config
 * @returns The localForage instance
 */
export function getClient(
  config: LocalForageOptions,
  target?: LocalForageOptions,
) {
  // Convert config objects to strings to use as cache keys
  let configString = JSON.stringify(config);
  let targetString = JSON.stringify(target);

  // Target config takes precedence if provided
  if (!!targetString) {
    // Check if instance already exists in cache
    if (clientCache.hasCache(targetString)) {
      return clientCache.getCache(targetString) as LocalForage;
    }
    // Create new instance with target config and cache it
    const newInstance = localForage.createInstance(target!);
    clientCache.addCache(targetString, newInstance);
    return newInstance;
  }

  // Use provided config if no target and config exists
  if (!!configString) {
    // Check if instance already exists in cache
    if (clientCache.hasCache(configString)) {
      return clientCache.getCache(configString) as LocalForage;
    }
    // Create new instance with config and cache it
    const newInstance = localForage.createInstance(config);
    clientCache.addCache(configString, newInstance);
    return newInstance;
  }

  // Return default localForage instance if no config provided
  return localForage;
}
