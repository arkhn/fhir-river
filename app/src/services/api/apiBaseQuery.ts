import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@rtk-incubator/rtk-query";
import { API_URL } from "./constants";

/**
 * Fetch wrapper
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  // TODO: handle authentication
  // credentials: "include",
  // prepareHeaders: (headers) => {
  //   const token = Cookies.get("csrftoken");
  //   if (token) {
  //     headers.set("X-CSRFToken", token);
  //   }
  //   return headers;
  // },
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
    // TODO: handle authentication errors
    // api.dispatch(logout());
  }
  return result;
};
