import { act, renderHook } from "@testing-library/react";
import * as React from "react";
import { LocalForageProvider, useLocalForage } from "../context";

const mockMethods = {
  setItem: jest.fn().mockImplementation((_key, value) => Promise.resolve(value)),
  getItem: jest.fn().mockImplementation((_key) => Promise.resolve(undefined)),
  removeItem: jest.fn().mockImplementation(() => Promise.resolve()),
  clear: jest.fn().mockImplementation(() => Promise.resolve()),
  createInstance: jest.fn()
};

jest.mock("localforage", () => ({
  __esModule: true,
  default: mockMethods,
  createInstance: jest.fn(() => mockMethods)
}));

jest.mock('../utils', () => ({
  __esModule: true,
  getClient: jest.fn((_config, _target) => mockMethods),
  isBrowser: true
}));

type WrapperProps = {
  children: React.ReactNode;
  config?: Record<string, any>;
  initialValues?: Record<string, any>;
};

const Wrapper = ({
  children,
  config = {},
  initialValues = {},
}: WrapperProps) => {
  return (
    <LocalForageProvider config={config} initialValues={initialValues}>
      {children}
    </LocalForageProvider>
  );
};

describe("LocalForageContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMethods.getItem.mockImplementation((_key) => Promise.resolve(undefined));
  });

  describe("useLocalForage", () => {
    it("should return default values", async () => {
      const { result } = renderHook(() => useLocalForage("test-key"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current).toEqual({
        value: undefined,
        set: expect.any(Function),
        remove: expect.any(Function),
        loading: false,
      });
    });

    it("should set and get values", async () => {
      const mockValue = { test: "value" };
      mockMethods.setItem.mockImplementation((_key, value) => Promise.resolve(value));
      mockMethods.getItem.mockImplementation((_key) => Promise.resolve(mockValue));

      const { result } = renderHook(() => useLocalForage("test-key"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.set(mockValue);
      });

      expect(mockMethods.setItem).toHaveBeenCalledWith("test-key", mockValue);
      expect(result.current.value).toEqual(mockValue);
      expect(result.current.loading).toBe(false);
    });

    it("should handle errors with custom error handler", async () => {
      const error = new Error("test error");
      const errorSetHandler = jest.fn();
      mockMethods.setItem.mockImplementation(() => Promise.reject(error));

      const { result } = renderHook(
        () => useLocalForage("test-key", { errorSetHandler }),
        {
          wrapper: Wrapper,
        }
      );

      await act(async () => {
        await result.current.set("test-value");
      });

      expect(errorSetHandler).toHaveBeenCalledWith(error);
    });

    it("should handle errors with console.error by default", async () => {
      const error = new Error("test error");
      const consoleError = jest.spyOn(console, "error");
      mockMethods.setItem.mockImplementation(() => Promise.reject(error));

      const { result } = renderHook(() => useLocalForage("test-key"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.set("test-value");
      });

      expect(consoleError).toHaveBeenCalledWith(error);
      consoleError.mockRestore();
    });
  });
});
