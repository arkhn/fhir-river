import React from "react";

import {
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import {
  useApiUserRetrieveQuery,
  useOidcLogoutMutation,
} from "services/api/endpoints";

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

const UserAuth = (): JSX.Element | null => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { isLoading, data: user } = useApiUserRetrieveQuery({});
  const [oidcLogout] = useOidcLogoutMutation();

  const handleLogout = () => {
    oidcLogout({});
  };

  if (isLoading) return <CircularProgress />;
  if (user)
    return (
      <>
        <Typography color="textSecondary">{user.email}</Typography>
        <Divider orientation="vertical" className={classes.verticalDivider} />
        <Button
          onClick={handleLogout}
          className={classes.button}
          startIcon={<ExitToApp className={classes.icon} />}
        >
          <Typography color="textSecondary">{t("logout")}</Typography>
        </Button>
      </>
    );
  return null;
};

export default UserAuth;
