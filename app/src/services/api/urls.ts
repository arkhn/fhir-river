let API_URL = "" as string | undefined;
if (process.env.NODE_ENV === "production") {
  ({ REACT_APP_API_URL: API_URL } = (window as any).env);
} else {
  ({ REACT_APP_API_URL: API_URL } = process.env);
}

export { API_URL };
