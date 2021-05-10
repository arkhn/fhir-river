import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import Cookies from "js-cookie";

import { OIDC_LOGIN_URL } from "services/oidc/urls";

import { API_URL } from "./urls";

const { REACT_APP_CSRF_COOKIE_NAME: CSRF_COOKIE_NAME } = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  redirect: "manual",
  prepareHeaders: (headers) => {
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
