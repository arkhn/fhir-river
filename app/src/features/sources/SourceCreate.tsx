import React from "react";

import { Button, makeStyles, Typography } from "@material-ui/core";

import { useAppDispatch } from "../../app/store";
import { Source } from "../../services/api/generated/api.generated";
import { editSource } from "./sourceSlice";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

const SourceCreate = (): JSX.Element => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClick = () => dispatch(editSource({} as Source));

  return (
    <Button
      className={classes.button}
      color="primary"
      variant="contained"
      onClick={handleClick}
    >
      <Typography>New Source</Typography>
    </Button>
  );
};

export default SourceCreate;
