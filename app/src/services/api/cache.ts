import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type CacheItem<T, ID> = { type: T; id: ID };

type CacheList<T, ID> = (CacheItem<T, "LIST"> | CacheItem<T, ID>)[];

type Item = { id: unknown };

type ProvidesListFn<T> = <
  Results extends Item[],
  Error extends FetchBaseQueryError
>(
  results?: Results,
  error?: Error
) => CacheList<T, Results[number]["id"]>;

export const providesList = <T extends string>(type: T): ProvidesListFn<T> => (
  results,
  _error
) =>
  results
    ? [...results.map(({ id }) => ({ type, id })), { type, id: "LIST" }]
    : [{ type, id: "LIST" }];

type ProvidesOneFn<T> = <
  Result,
  Error extends FetchBaseQueryError,
  Arg extends Item
>(
  result: Result | undefined,
  error: Error | undefined,
  arg: Arg
) => [CacheItem<T, Arg["id"]>];

export const providesOne = <T extends string>(type: T): ProvidesOneFn<T> => (
  _result,
  _error,
  { id }
) => [{ type, id }];

type InvalidatesListFn<T> = () => [CacheItem<T, "LIST">];

export const invalidatesList = <T extends string>(
  type: T
): InvalidatesListFn<T> => () => [{ type, id: "LIST" }];

type InvalidatesOneFn<T> = <
  Result,
  Error extends FetchBaseQueryError,
  Arg extends Item
>(
  result: Result | undefined,
  error: Error | undefined,
  arg: Arg
) => [CacheItem<T, Arg["id"]>];

export const invalidatesOne = <T extends string>(
  type: T
): InvalidatesOneFn<T> => (_result, _error, { id }) => [{ type, id }];
