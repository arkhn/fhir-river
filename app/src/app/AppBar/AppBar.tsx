import React from "react";

import AppBarArkhnUI from "@arkhn/ui/lib/NavBar/NavBar";
import { Button, Divider, makeStyles, Typography } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useAppSelector } from "app/store";
import { ReactComponent as Logo } from "assets/icons/arkhn-logo.svg";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: "#444444",
  },
  logo: {
    height: 27,
    width: 21,
    marginRight: 16,
    "& path": {
      fill: theme.palette.primary.light,
    },
  },
  link: {
    display: "flex",
    textDecoration: "none",
    width: "fit-content",
  },
  titleContainer: {
    flexGrow: 1,
  },
  mainTitle: {
    color: theme.palette.primary.light,
    marginRight: theme.spacing(1),
  },
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

const AppBar = (): JSX.Element => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state);
  const classes = useStyles();

  return (
    <AppBarArkhnUI
      appBarProps={{ className: classes.appBar }}
      title={
        <>
          <div className={classes.titleContainer}>
            <Link className={classes.link} to={"/"}>
              <Logo className={classes.logo} />
              <Typography
                className={classes.mainTitle}
                variant="h6"
                color="primary"
              >
                Pyrog
              </Typography>
              <Typography variant="h6" color="textSecondary">
                · Arkhn
              </Typography>
            </Link>
          </div>
          {user && (
            <>
              <Typography color="textSecondary">{user.mail}</Typography>
              <Divider
                orientation="vertical"
                className={classes.verticalDivider}
              />
              <Button className={classes.logoutButton}>
                <ExitToApp className={classes.logoutIcon} />
                <Typography color="textSecondary">{t("logout")}</Typography>
              </Button>
            </>
          )}
        </>
      }
    />
  );
};

export default AppBar;
