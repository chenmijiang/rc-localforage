import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import clientCache from "./ClientCache";
import type {
  ExtraOptions,
  LocalForageContextProps,
  LocalForageProviderProps,
  UseLocalForageResult,
} from "./type";
import { getClient, isBrowser } from "./utils";

/**
 * The context for the LocalForageProvider
 * @type {React.Context<LocalForageContextProps>}
 */
export const LocalForageContext = createContext<LocalForageContextProps>({
  config: {},
  initialValues: {},
});

/**
 * The provider for the LocalForageContext
 * @param {LocalForageProviderProps} props - The props for the LocalForageProvider
 * @returns {React.ReactNode} The provider for the LocalForageContext
 */
export const LocalForageProvider = ({
  children,
  config = {},
  initialValues = {},
}: LocalForageProviderProps) => {
  // memoize the config and initialValues
  const memoizedConfig = useMemo(() => config, [config]);
  const memoizedInitialValues = useMemo(() => initialValues, [initialValues]);

  // memoize the provider value
  const memoizedProviderValue = useMemo(
    () => ({
      config: memoizedConfig,
      initialValues: memoizedInitialValues,
    }),
    [memoizedConfig, memoizedInitialValues],
  );

  return createElement(
    LocalForageContext.Provider,
    {
      value: memoizedProviderValue,
    },
    children,
  );
};

export function useLocalForage<TState = any>(
  key: string,
  options?: ExtraOptions<TState>,
): UseLocalForageResult<TState> {
  const { defaultValue, target } = options ?? {};
  // determine whether it is a browser environment, if not, return the default value
  if (!isBrowser) {
    return {
      value: defaultValue,
      set: (_val: TState) => {},
      remove: () => {},
      loading: true,
    };
  }

  const { config, initialValues } = useContext(LocalForageContext);
  // If defaultValue is set, it will override the initial value of the Provider
  const [value, setValue] = useState<TState | undefined>(
    defaultValue !== undefined
      ? defaultValue
      : (initialValues?.[key] as TState | undefined),
  );

  const [loading, setLoading] = useState<boolean>(true);

  const set = (val: TState) => {
    const client = getClient(config, target);
    setLoading(true);
    client
      .setItem(key, val)
      .then(() => client.getItem(key))
      .then((val) => {
        setValue(val as TState);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (!!options?.errorSetHandler) {
          options.errorSetHandler(err);
        } else {
          console.error(err);
        }
      });
  };

  // initialize the value
  useEffect(() => {
    const client = getClient(config, target);
    client
      .getItem(key)
      .then((val) => {
        setValue(val as TState);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (!!options?.errorGetHandler) {
          options.errorGetHandler(err);
        } else {
          console.error(err);
        }
      });
  }, [key, config, target]);

  useEffect(() => {
    let configKey = target ? JSON.stringify(target) : JSON.stringify(config);

    const handleStorageChange = () => {
      if (!clientCache.hasCache(configKey)) {
        setValue(undefined!);
        return;
      }
      clientCache
        .getCache(configKey)
        ?.length()
        .then((length) => {
          if (length === 0) {
            setValue(undefined!);
          }
        });
    };

    clientCache.addEventListener("change", handleStorageChange);

    return () => {
      clientCache.removeEventListener("change", handleStorageChange);
    };
  }, []);

  const remove = () => {
    const client = getClient(config, target);
    client
      .removeItem(key)
      .then(() => {
        setValue(undefined);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (!!options?.errorGetHandler) {
          options.errorGetHandler(err);
        } else {
          console.error(err);
        }
      });
  };

  return {
    value,
    set,
    remove,
    loading,
  };
}
