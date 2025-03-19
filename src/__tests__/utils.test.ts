import { getClient, isBrowser } from '../utils';
import localForage from 'localforage';
import clientCache from '../ClientCache';

jest.mock('localforage', () => {
  const mockMethods = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    createInstance: jest.fn()
  };
  return {
    ...mockMethods,
    createInstance: jest.fn(() => mockMethods),
    __esModule: true,
    default: mockMethods
  };
});

jest.mock('../ClientCache', () => ({
  __esModule: true,
  default: {
    hasCache: jest.fn(),
    getCache: jest.fn(),
    addCache: jest.fn()
  }
}));

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBrowser', () => {
    it('should be true when window is defined', () => {
      expect(isBrowser).toBe(true);
    });
  });

  describe('getClient', () => {
    const mockMethods = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      createInstance: jest.fn()
    };

    beforeEach(() => {
      (localForage.createInstance as jest.Mock).mockReturnValue(mockMethods);
    });

    it('should return default localForage instance when no config provided', () => {
      const result = getClient({});
      expect(result).toEqual(localForage);
    });

    it('should create new instance with config and cache it', () => {
      const config = { name: 'testDB' };
      (clientCache.hasCache as jest.Mock).mockReturnValue(false);
      
      const result = getClient(config);
      
      expect(localForage.createInstance).toHaveBeenCalledWith(config);
      expect(clientCache.addCache).toHaveBeenCalledWith(JSON.stringify(config), mockMethods);
      expect(result).toBe(mockMethods);
    });

    it('should return cached instance if exists', () => {
      const config = { name: 'testDB' };
      (clientCache.hasCache as jest.Mock).mockReturnValue(true);
      (clientCache.getCache as jest.Mock).mockReturnValue(mockMethods);
      
      const result = getClient(config);
      
      expect(localForage.createInstance).not.toHaveBeenCalled();
      expect(result).toBe(mockMethods);
    });

    it('should use target config when provided', () => {
      const config = { name: 'defaultDB' };
      const target = { name: 'targetDB' };
      (clientCache.hasCache as jest.Mock).mockReturnValue(false);
      
      const result = getClient(config, target);
      
      expect(localForage.createInstance).toHaveBeenCalledWith(target);
      expect(clientCache.addCache).toHaveBeenCalledWith(JSON.stringify(target), mockMethods);
      expect(result).toBe(mockMethods);
    });
  });
}); 
