/**
 * Core type definitions
 */

// SDK configuration types
export interface SDKOptions {
  version?: string;
}

export interface SDKConfig {
  version: string;
}

// Event system types
export type EventHandler<T = any> = (data: T) => void;
export interface EventMap {
  [key: string]: any;
}

// Memory system types
export interface MemoryOptions {
  namespace?: string;
  persist?: boolean;
}

export interface MemoryItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
}

export interface MemoryQuery {
  prefix?: string;
  limit?: number;
}

// Utility types
export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable };

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export type DeepReadonly<T> = T extends Serializable
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;
