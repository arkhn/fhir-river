import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type CacheItem<T, ID> = { type: T; id: ID };

type CacheList<T, ID> = [CacheItem<T, "LIST">, ...CacheItem<T, ID>[]];

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
    ? [{ type, id: "LIST" }, ...results.map(({ id }) => ({ type, id }))]
    : [{ type, id: "LIST" }];

type ProvidesPaginatedListFn<T> = <
  Results extends Item[],
  Error extends FetchBaseQueryError
>(
  data?: { results?: Results },
  error?: Error
) => CacheList<T, Results[number]["id"]>;

export const providesPaginatedList = <T extends string>(
  type: T
): ProvidesPaginatedListFn<T> => (data, _error) =>
  data?.results
    ? [
        { type, id: "LIST" },
        ...data.results.map(({ id }) => ({
          type,
          id,
        })),
      ]
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

type InvalidatesOneFn<T, U extends unknown[]> = <
  Result,
  Error extends FetchBaseQueryError,
  Arg extends Item
>(
  result: Result | undefined,
  error: Error | undefined,
  arg: Arg
) => [CacheItem<T, Arg["id"]>, ...CacheItem<U[number], "LIST">[]];

export const invalidatesOne = <T extends string, U extends string[]>(
  type: T,
  options?: { cascades?: U }
): InvalidatesOneFn<T, U> => (_result, _error, { id }) =>
  options?.cascades
    ? [
        { type, id },
        ...options.cascades.map((type) => ({ type, id: "LIST" as const })),
      ]
    : [{ type, id }];
