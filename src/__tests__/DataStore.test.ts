import localForage from "localforage";
import clientCache from "../ClientCache";
import { DRIVER, dropDataStore, removeDataStoreItems } from "../DataStore";

jest.mock("../utils", () => ({
  isBrowser: true,
}));

jest.mock("localforage", () => ({
  createInstance: jest.fn(),
  dropInstance: jest.fn(),
  clear: jest.fn().mockResolvedValue(undefined),
  WEBSQL: "webSQL",
  INDEXEDDB: "indexedDB",
  LOCALSTORAGE: "localStorage",
  __esModule: true,
  default: {
    dropInstance: jest.fn(),
    clear: jest.fn().mockResolvedValue(undefined),
    WEBSQL: "webSQL",
    INDEXEDDB: "indexedDB",
    LOCALSTORAGE: "localStorage",
  },
}));

describe("DataStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clientCache.clear();
  });

  describe("dropDataStore", () => {
    it("should drop instance and remove from cache", () => {
      const config = { name: "testDB" };
      const configString = JSON.stringify(config);

      // Add mock instance to cache
      clientCache.addCache(configString, localForage);

      dropDataStore(config);

      expect(localForage.dropInstance).toHaveBeenCalled();
      expect(clientCache.hasCache(configString)).toBe(false);
    });

    it("should handle empty config", () => {
      dropDataStore();
      expect(localForage.dropInstance).not.toHaveBeenCalled();
    });

    it("should use default instance when capture is true", () => {
      dropDataStore({}, true);
      expect(localForage.dropInstance).toHaveBeenCalled();
    });
  });

  describe("removeDataStoreItems", () => {
    it("should clear items and refresh cache", async () => {
      const config = { name: "testDB" };
      const configString = JSON.stringify(config);

      // Add mock instance to cache
      clientCache.addCache(configString, localForage);

      removeDataStoreItems(config);

      expect(localForage.clear).toHaveBeenCalled();
      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("should handle empty config", () => {
      removeDataStoreItems();
      expect(localForage.clear).not.toHaveBeenCalled();
    });

    it("should use default instance when capture is true", () => {
      removeDataStoreItems({}, true);
      expect(localForage.clear).toHaveBeenCalled();
    });
  });

  describe("DRIVER", () => {
    it("should expose correct driver constants", () => {
      expect(DRIVER.WEBSQL).toBe("webSQL");
      expect(DRIVER.INDEXEDDB).toBe("indexedDB");
      expect(DRIVER.LOCALSTORAGE).toBe("localStorage");
    });
  });
});
