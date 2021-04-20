import React from "react";

import { CircularProgress } from "@material-ui/core";
import { Redirect, Route, RouteProps } from "react-router";

import { useApiUserRetrieveQuery } from "services/api/endpoints";

const UserRoute = ({ ...routeProps }: RouteProps): JSX.Element => {
  const { isLoading, data: user } = useApiUserRetrieveQuery({});
  const isAuthenticated = Boolean(user);

  if (isLoading) return <CircularProgress />;
  if (isAuthenticated) return <Route {...routeProps} />;

  return <Redirect to="/" />;
};

export default UserRoute;
