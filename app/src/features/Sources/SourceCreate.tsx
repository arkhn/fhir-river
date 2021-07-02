import React from "react";

import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";

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

  const handleCreateSource = () => dispatch(createSource());

  return (
    <Button
      className={classes.button}
      color="primary"
      variant="contained"
      onClick={handleCreateSource}
    >
      {t("newSource")}
    </Button>
  );
};

export default SourceCreate;
