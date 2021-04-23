import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Button, makeStyles, Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "app/store";
import { useApiSourcesRetrieveQuery } from "services/api/endpoints";
import { Source } from "services/api/generated/api.generated";

import { editSource } from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: "none",
  },
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
}));

const SourceEditButton = (): JSX.Element => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { id } = useParams<Pick<Source, "id">>();
  const { data: source } = useApiSourcesRetrieveQuery({ id }, { skip: !id });

  const handleSourceEdit = () => {
    if (source) dispatch(editSource(source));
  };

  return (
    <Button
      size="small"
      variant="contained"
      className={classes.button}
      startIcon={<Icon icon={IconNames.COG} className={classes.icon} />}
      onClick={handleSourceEdit}
    >
      <Typography>Settings</Typography>
    </Button>
  );
};

export default SourceEditButton;
