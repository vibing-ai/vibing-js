/**
 * TypeScript utility types for the Vibing AI SDK
 *
 * This file contains utility types that help improve type safety and developer
 * experience throughout the SDK.
 */

/**
 * Utility type definitions
 */

// Re-export from core types for better organization
export * from '../core/types';

/**
 * Makes all properties in T optional, recursively.
 *
 * @example
 * type User = {
 *   name: string;
 *   profile: {
 *     age: number;
 *     bio: string;
 *   }
 * };
 *
 * // Allows: { name?: string, profile?: { age?: number, bio?: string } }
 * type PartialUser = DeepPartial<User>;
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Makes all properties in T required and non-nullable, recursively.
 *
 * @example
 * type Config = {
 *   name?: string;
 *   options?: {
 *     theme?: string;
 *     debug?: boolean;
 *   }
 * };
 *
 * // Requires: { name: string, options: { theme: string, debug: boolean } }
 * type RequiredConfig = DeepRequired<Config>;
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<NonNullable<T[P]>>;
    }
  : T;

/**
 * Removes 'readonly' modifiers from all properties in T, recursively.
 *
 * @example
 * type ReadonlyConfig = {
 *   readonly name: string;
 *   readonly settings: {
 *     readonly theme: string;
 *   }
 * };
 *
 * // Allows: { name: string, settings: { theme: string } }
 * type MutableConfig = Mutable<ReadonlyConfig>;
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P];
};

/**
 * Makes all properties in T non-null and defined.
 *
 * @example
 * type PartialData = {
 *   id?: string;
 *   value: string | null;
 * };
 *
 * // Results in: { id: string, value: string }
 * type CompleteData = NonNullableProperties<PartialData>;
 */
export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Creates a branded type for improved type safety of primitive types.
 *
 * @example
 * type UserId = Brand<string, 'UserId'>;
 * type CardId = Brand<string, 'CardId'>;
 *
 * // TypeScript will error if you try to use a UserId where a CardId is expected
 * function getCard(id: CardId) { ... }
 * const userId: UserId = 'user_123' as UserId;
 * getCard(userId); // Error: Argument of type 'UserId' is not assignable to parameter of type 'CardId'
 */
export type Brand<T, K extends string> = T & { __brand: K };

// Common branded types used throughout the SDK
export type AppId = Brand<string, 'AppId'>;
export type PluginId = Brand<string, 'PluginId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type SurfaceId = Brand<string, 'SurfaceId'>;

/**
 * Extracts the keys of T where the value type is assignable to U.
 *
 * @example
 * type Data = {
 *   id: string;
 *   count: number;
 *   isActive: boolean;
 *   meta: object;
 * };
 *
 * // Results in: "count"
 * type NumberKeys = KeysOfType<Data, number>;
 */
export type KeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * Creates a union type from the values of an object.
 *
 * @example
 * const Colors = {
 *   RED: 'red',
 *   BLUE: 'blue',
 *   GREEN: 'green',
 * } as const;
 *
 * // Results in: "red" | "blue" | "green"
 * type Color = ValueOf<typeof Colors>;
 */
export type ValueOf<T> = T[keyof T];

/**
 * Helper type to create literal union types with autocomplete.
 * When used with string literals, it provides autocomplete while still allowing any string.
 *
 * @example
 * type Theme = LiteralUnion<'light' | 'dark', string>;
 *
 * // Will suggest 'light' and 'dark' in autocomplete but allows any string
 * function setTheme(theme: Theme) { ... }
 */
export type LiteralUnion<L extends U, U = string> = L | (U & Record<never, never>);

/**
 * Represents a promise or the resolved value of a promise.
 *
 * @example
 * // Function can return either a string or a Promise<string>
 * function getData(): MaybePromise<string> { ... }
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Gets the function return type, handling async functions properly.
 *
 * @example
 * async function getData(): Promise<string> { return "data"; }
 *
 * // Results in: string
 * type DataType = AsyncReturnType<typeof getData>;
 */
export type AsyncReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : T extends (...args: unknown[]) => infer R
    ? R
    : never;
