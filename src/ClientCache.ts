/**
 * A singleton class that manages client-side caching using LocalForage instances
 * @class ClientCache
 */
class ClientCache {
  /**
   * The singleton instance of the ClientCache
   * @private
   * @static
   * @type {ClientCache}
   */
  private static instance: ClientCache;
  /**
   * Map storing LocalForage instances with their corresponding keys
   * @private
   * @type {Map<string, LocalForage>}
   */
  private _cache: Map<string, LocalForage>;
  /**
   * Event listeners registry
   * @public
   * @type {Record<string, Array<() => void>>}
   */
  public readonly events: Record<string, Array<() => void>>;

  constructor() {
    this._cache = new Map<string, LocalForage>();
    this.events = {};
  }

  /**
   * Gets the singleton instance of ClientCache
   * @public
   * @static
   * @returns {ClientCache} The singleton instance
   */
  public static getInstance(): ClientCache {
    if (!ClientCache.instance) {
      ClientCache.instance = new ClientCache();
    }
    return ClientCache.instance;
  }

  /**
   * Adds a LocalForage instance to the cache
   * @public
   * @param {string} key - Unique identifier for the cache instance
   * @param {LocalForage} cache - LocalForage instance to be stored
   * @returns {void}
   */
  public addCache(key: string, cache: LocalForage): void {
    this._cache.set(key, cache);
    this.triggerEvent("change");
  }

  /**
   * Retrieves a LocalForage instance from the cache
   * @public
   * @param {string} key - Key of the cache to retrieve
   * @returns {LocalForage | undefined} The cached LocalForage instance or undefined if not found
   */
  public getCache(key: string): LocalForage | undefined {
    return this._cache.get(key);
  }

  /**
   * Checks if a cache exists for the given key
   * @public
   * @param {string} key - Key to check
   * @returns {boolean} True if cache exists, false otherwise
   */
  public hasCache(key: string): boolean {
    return this._cache.has(key);
  }

  /**
   * Removes a cache instance by its key
   * @public
   * @param {string} key - Key of the cache to remove
   * @returns {void}
   */
  public removeCache(key: string): void {
    this._cache.delete(key);
    this.triggerEvent("change");
  }

  /**
   * Triggers a refresh event for the cache
   * @public
   * @returns {void}
   */
  public refleshCache(): void {
    this.triggerEvent("change");
  }

  /**
   * Registers an event listener
   * @public
   * @param {string} event - Name of the event to listen for
   * @param {() => void} listener - Callback function to execute when event occurs
   * @returns {void}
   */
  public addEventListener(event: string, listener: () => void): void {
    if (typeof this.events[event] !== "object") {
      this.events[event] = [];
    }

    this.events[event].push(listener);
  }

  /**
   * Removes an event listener
   * @public
   * @param {string} event - Name of the event to remove listener from
   * @param {() => void} listener - Listener function to remove
   * @returns {void}
   */
  public removeEventListener(event: string, listener: () => void): void {
    if (typeof this.events[event] === "object") {
      const idx = this.events[event].indexOf(listener);

      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  /**
   * Triggers all registered listeners for a given event
   * @private
   * @param {string} event - Name of the event to trigger
   * @returns {void}
   */
  private triggerEvent(event: string): void {
    if (typeof this.events[event] === "object") {
      this.events[event].forEach((listener) => {
        try {
          listener.call(this);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
}

export default ClientCache.getInstance();
