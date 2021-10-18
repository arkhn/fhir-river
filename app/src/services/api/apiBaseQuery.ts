import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import Cookies from "js-cookie";

import { API_URL, CSRF_COOKIE_NAME, OIDC_LOGIN_URL } from "../../constants";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("X-Requested-With", "XMLHttpRequest");
    const token = Cookies.get(CSRF_COOKIE_NAME || "pyrog_csrftoken");
    if (token) {
      headers.set("X-CSRFToken", token);
    }
    return headers;
  },
});

export const apiBaseQuery: ReturnType<typeof fetchBaseQuery> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 403)
    window.location.replace(OIDC_LOGIN_URL ?? "");
  return result;
};
