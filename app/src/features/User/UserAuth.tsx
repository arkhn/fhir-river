import React from "react";

import {
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import {
  useApiUserRetrieveQuery,
  useOidcLogoutMutation,
} from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
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
          color="inherit"
          startIcon={<ExitToApp className={classes.icon} />}
          typographyColor="textSecondary"
        >
          {t("logout")}
        </Button>
      </>
    );
  return null;
};

export default UserAuth;
