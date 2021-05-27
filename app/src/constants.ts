type EnhancedWindow = typeof window & {
  env: {
    PUBLIC_URL: string;
    API_URL?: string;
    OIDC_LOGIN_URL?: string;
    CSRF_COOKIE_NAME?: string;
  };
};

let {
  PUBLIC_URL,
  REACT_APP_API_URL: API_URL,
  REACT_APP_OIDC_LOGIN_URL: OIDC_LOGIN_URL,
  REACT_APP_CSRF_COOKIE_NAME: CSRF_COOKIE_NAME,
} = process.env;

// when using the app with a production build, environment variables are templated in index.html.
if (process.env.NODE_ENV === "production") {
  ({
    PUBLIC_URL,
    API_URL,
    OIDC_LOGIN_URL,
    CSRF_COOKIE_NAME,
  } = (window as EnhancedWindow).env);
}

export { PUBLIC_URL, API_URL, OIDC_LOGIN_URL, CSRF_COOKIE_NAME };