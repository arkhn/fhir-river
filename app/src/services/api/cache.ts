import { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";

export const defaultTags = ["FORBIDDEN", "UNKNOWN_ERROR"] as const;

type DefaultTags = typeof defaultTags[number];

type CacheItem<T, ID> = { type: T; id: ID };

type CacheList<T, ID> = (
  | CacheItem<T, "LIST">
  | CacheItem<T, ID>
  | DefaultTags
)[];

type ProvidesListFn<T> = <
  Results extends { id: unknown }[],
  Error extends FetchBaseQueryError
>(
  results?: Results,
  error?: Error
) => CacheList<T, Results[number]["id"]>;

export const providesList = <T extends string>(type: T): ProvidesListFn<T> => (
  results,
  error
) => {
  if (results && !error) {
    return [...results.map(({ id }) => ({ type, id })), { type, id: "LIST" }];
  }
  return [{ type, id: "LIST" }];
};

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
