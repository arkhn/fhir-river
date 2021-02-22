import React from "react";
import NavBarArkhnUI from "@arkhn/ui/lib/NavBar/NavBar";
import { Link } from "react-router-dom";

import { ReactComponent as Logo } from "assets/icons/arkhn-logo.svg";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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

const NavBar = (): JSX.Element => {
  const classes = useStyles();
  return (
    <NavBarArkhnUI
      title={
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
            <Typography variant="h6" color="textPrimary">
              · Arkhn
            </Typography>
          </Link>
        </div>
      }
    />
  );
};

export default NavBar;
