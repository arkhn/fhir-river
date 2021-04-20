import { fetchBaseQuery } from "@rtk-incubator/rtk-query";
import Cookies from "js-cookie";
import { omitBy, isUndefined } from "lodash";

import { API_URL } from "./urls";

/**
 * Fetch wrapper
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = Cookies.get("csrftoken");
    if (token) {
      headers.set("X-CSRFToken", token);
    }
    return headers;
  },
});

/**
 * Equivalent to axios interceptor
 * @param args
 * @param api
 * @param extraOptions
 */
export const apiBaseQuery: ReturnType<typeof fetchBaseQuery> = async (
  args,
  api,
  extraOptions
) => {
  // FIXME: Remove this condition after the next rtk-query > 0.2.0 release
  // Undefined query params should be excluded.
  // Fixed by https://github.com/rtk-incubator/rtk-query/pull/146
  if (typeof args !== "string" && args.params) {
    args = {
      ...args,
      params: omitBy({ ...args.params }, isUndefined),
    };
  }
  const result = await baseQuery(args, api, extraOptions);
  // if (result.error?.status === 401) api.dispatch(logout());
  return result;
};
