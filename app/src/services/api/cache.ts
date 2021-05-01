import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type CacheItem<T, ID> = { type: T; id: ID };

type CacheList<T, ID> = (CacheItem<T, "LIST"> | CacheItem<T, ID>)[];

type ProvidesListFn<T> = <
  Results extends { id: unknown }[],
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

type ProvidesFhirBundleFn<T> = <
  Results extends { entry: { resource: { id: unknown } }[] },
  Error extends FetchBaseQueryError
>(
  results?: Results,
  error?: Error
) => CacheList<T, Results["entry"][number]["resource"]["id"]>;

export const providesFhirBundle = <T extends string>(
  type: T
): ProvidesFhirBundleFn<T> => (results, _error) =>
  results?.entry && results.entry.length > 0
    ? [
        ...results.entry
          .map(
            (entry) =>
              !!entry.resource?.id && {
                type,
                id: entry.resource.id,
              }
          )
          .filter((item): item is { id: unknown; type: T } => Boolean(item)),
        { type, id: "LIST" },
      ]
    : [{ type, id: "LIST" }];

type ProvidesOneFn<T> = <
  Result,
  Error extends FetchBaseQueryError,
  Arg extends { id: unknown }
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
  Arg extends { id: unknown }
>(
  result: Result | undefined,
  error: Error | undefined,
  arg: Arg
) => [CacheItem<T, Arg["id"]>];

export const invalidatesOne = <T extends string>(
  type: T
): InvalidatesOneFn<T> => (_result, _error, { id }) => [{ type, id }];
