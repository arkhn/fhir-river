import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@rtk-incubator/rtk-query";

export const { REACT_APP_API_URL: API_URL } = process.env;

/**
 * Fetch wrapper
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
});

/**
 * Equivalent to axios interceptor
 * @param args
 * @param api
 * @param extraOptions
 */
export const apiBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    //TODO: To plug later (Auth)
    // api.dispatch(logout());
  }
  return result;
};
