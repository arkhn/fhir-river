import React from "react";

import AppBarArkhnUI from "@arkhn/ui/lib/NavBar/NavBar";
import { makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

import { ReactComponent as Logo } from "assets/icons/arkhn-logo.svg";
import UserAuth from "features/User/UserAuth";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.appBar.main,
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
}));

const AppBar = (): JSX.Element => {
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
          <UserAuth />
        </>
      }
    />
  );
};

export default AppBar;
