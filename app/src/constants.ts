type EnhancedWindow = typeof window & {
  env: {
    API_URL?: string;
    OIDC_LOGIN_URL?: string;
    OIDC_LOGOUT_URL?: string;
    CSRF_COOKIE_NAME?: string;
  };
};

(window as EnhancedWindow).env =
  process.env.NODE_ENV == "development"
    ? (process.env as any)
    : (window as EnhancedWindow).env;

export const {
  API_URL,
  OIDC_LOGIN_URL,
  OIDC_LOGOUT_URL,
  CSRF_COOKIE_NAME,
} = (window as EnhancedWindow).env;
