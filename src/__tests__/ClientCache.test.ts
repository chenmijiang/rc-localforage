import clientCache from '../ClientCache';
import type localforage from 'localforage';

describe('ClientCache', () => {
  const mockLocalForage = {
    config: () => {},
    getItem: () => {},
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: () => {},
    key: () => {},
    keys: () => {},
    iterate: () => {},
  } as unknown as typeof localforage;

  beforeEach(() => {
    clientCache.clear();
  });

  it('should be a singleton', () => {
    expect(clientCache).toBeTruthy();
  });

  describe('cache operations', () => {
    it('should add and get cache', () => {
      const key = 'test-key';
      clientCache.addCache(key, mockLocalForage);
      expect(clientCache.getCache(key)).toBe(mockLocalForage);
    });

    it('should check if cache exists', () => {
      const key = 'test-key';
      expect(clientCache.hasCache(key)).toBe(false);
      clientCache.addCache(key, mockLocalForage);
      expect(clientCache.hasCache(key)).toBe(true);
    });

    it('should remove cache', () => {
      const key = 'test-key';
      clientCache.addCache(key, mockLocalForage);
      expect(clientCache.hasCache(key)).toBe(true);
      clientCache.removeCache(key);
      expect(clientCache.hasCache(key)).toBe(false);
    });

    it('should clear all caches', () => {
      const keys = ['key1', 'key2', 'key3'];
      keys.forEach(key => clientCache.addCache(key, mockLocalForage));
      keys.forEach(key => expect(clientCache.hasCache(key)).toBe(true));
      clientCache.clear();
      keys.forEach(key => expect(clientCache.hasCache(key)).toBe(false));
    });
  });

  describe('event handling', () => {
    it('should add and trigger event listeners', () => {
      const listener = jest.fn();
      clientCache.addEventListener('change', listener);
      clientCache.addCache('test-key', mockLocalForage);
      expect(listener).toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      const listener = jest.fn();
      clientCache.addEventListener('change', listener);
      clientCache.removeEventListener('change', listener);
      clientCache.addCache('test-key', mockLocalForage);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple event listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      clientCache.addEventListener('change', listener1);
      clientCache.addEventListener('change', listener2);
      clientCache.addCache('test-key', mockLocalForage);
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle errors in event listeners gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      clientCache.addEventListener('change', errorListener);
      clientCache.addCache('test-key', mockLocalForage);
      
      expect(errorListener).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });
}); 
