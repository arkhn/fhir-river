import React from "react";

import { Button, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";

import { createSource } from "./sourceSlice";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

const SourceCreate = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleCreateSource = () => dispatch(createSource({ name: "" }));

  return (
    <Button
      className={classes.button}
      color="primary"
      variant="contained"
      onClick={handleCreateSource}
    >
      <Typography>{t("newSource")}</Typography>
    </Button>
  );
};

export default SourceCreate;
