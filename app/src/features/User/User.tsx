import React from "react";

import {
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useTranslation } from "react-i18next/*";

import { useApiUserRetrieveQuery } from "services/api/endpoints";
import { OIDC_LOGIN_URL, OIDC_LOGOUT_URL } from "services/oidc/urls";

const useStyles = makeStyles((theme) => ({
  logoutButton: {
    textTransform: "none",
  },
  logoutIcon: {
    marginRight: theme.spacing(1),
    fill: theme.palette.text.secondary,
  },
  verticalDivider: {
    height: 25,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
}));

const User = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { isLoading, data: user } = useApiUserRetrieveQuery({});

  if (isLoading) return <CircularProgress />;
  return (
    <>
      {user ? (
        <>
          <Typography color="textSecondary">{user.email}</Typography>
          <Divider orientation="vertical" className={classes.verticalDivider} />
          <Button href={OIDC_LOGOUT_URL} className={classes.logoutButton}>
            <ExitToApp className={classes.logoutIcon} />
            <Typography color="textSecondary">{t("logout")}</Typography>
          </Button>
        </>
      ) : (
        <Button href={OIDC_LOGIN_URL} color="inherit">
          {t("login")}
        </Button>
      )}
    </>
  );
};

export default User;
