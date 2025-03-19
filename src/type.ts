import localforage from 'localforage';

export type LocalForageOptions = Parameters<(typeof localforage)['createInstance']>[0];

export type InitialValues = { [key: string]: any };

export interface LocalForageProviderProps {
  children: React.ReactNode;
  config?: LocalForageOptions;
  initialValues?: InitialValues;
}

export interface LocalForageContextProps {
  config: LocalForageOptions;
  initialValues: InitialValues;
}

export type ExtraOptions<T> = {
  // expire?: number;
  defaultValue?: T;
  target?: LocalForageOptions;
  errorSetHandler?: (err: any) => void;
  errorGetHandler?: (err: any) => void;
};

export interface UseLocalForageResult<T> {
  value: T | undefined;
  set: (val: T) => void;
  remove: () => void;
  loading: boolean;
}
