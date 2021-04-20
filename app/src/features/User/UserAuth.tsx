import React from "react";

import {
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ExitToApp, Launch } from "@material-ui/icons";
import type { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";
import { useTranslation } from "react-i18next";

import {
  useApiUserRetrieveQuery,
  useOidcLogoutMutation,
} from "services/api/endpoints";
import { OIDC_LOGIN_URL } from "services/oidc/urls";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  icon: {
    marginRight: theme.spacing(1),
    fill: theme.palette.text.secondary,
  },
  verticalDivider: {
    height: 25,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
}));

const UserAuth = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { isLoading, data: user } = useApiUserRetrieveQuery({});
  const [oidcLogout] = useOidcLogoutMutation();

  const handleLogout = async () => {
    try {
      await oidcLogout({}).unwrap();
    } catch (e) {
      // The oidc logout route returns a http-redirect (302).
      // Since Fetch redirect option is set to manual, we catch
      // a special response object with zeroed status
      const err: FetchBaseQueryError = e;
      if (err.status === 0) document.location.reload();
    }
  };

  if (isLoading) return <CircularProgress />;
  return (
    <>
      {user ? (
        <>
          <Typography color="textSecondary">{user.email}</Typography>
          <Divider orientation="vertical" className={classes.verticalDivider} />
          <Button onClick={handleLogout} className={classes.button}>
            <ExitToApp className={classes.icon} />
            <Typography color="textSecondary">{t("logout")}</Typography>
          </Button>
        </>
      ) : (
        <Button
          href={OIDC_LOGIN_URL}
          color="inherit"
          className={classes.button}
        >
          <Launch className={classes.icon} />
          <Typography color="textSecondary">{t("login")}</Typography>
        </Button>
      )}
    </>
  );
};

export default UserAuth;
