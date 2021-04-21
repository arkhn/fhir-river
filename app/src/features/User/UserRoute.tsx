import React from "react";

import { CircularProgress } from "@material-ui/core";
import { Route, RouteProps } from "react-router";

import { useApiUserRetrieveQuery } from "services/api/endpoints";
import { OIDC_LOGIN_URL } from "services/oidc/urls";

const UserRoute = ({ ...routeProps }: RouteProps): JSX.Element | null => {
  const { isLoading, data: user } = useApiUserRetrieveQuery({});
  const isAuthenticated = Boolean(user);

  if (isLoading) return <CircularProgress />;
  if (isAuthenticated) return <Route {...routeProps} />;

  window.location.replace(OIDC_LOGIN_URL ?? "");
  return null;
};

export default UserRoute;
