import React from "react";

import { Button, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import { Source } from "services/api/generated/api.generated";

import { editSource } from "./sourceSlice";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

const SourceCreate = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleClick = () => dispatch(editSource({ name: "" } as Source));

  return (
    <Button
      className={classes.button}
      color="primary"
      variant="contained"
      onClick={handleClick}
    >
      <Typography>{t("newSource")}</Typography>
    </Button>
  );
};

export default SourceCreate;
