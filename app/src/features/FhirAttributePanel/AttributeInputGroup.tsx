import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Button, makeStyles, Paper, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import {
  InputGroup,
  useApiInputGroupsDestroyMutation,
} from "services/api/generated/api.generated";

import Input from "./Input";

type AttributeInputGroupProps = {
  inputGroup: InputGroup;
};

const useStyles = makeStyles((theme) => ({
  inputGroups: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: theme.palette.background.default,
  },
  div: {
    width: "100%",
  },
  button: {
    textTransform: "none",
  },
  deleteButton: {
    alignSelf: "flex-end",
  },
  iconDelete: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
}));

const AttributeInputGroup = ({
  inputGroup,
}: AttributeInputGroupProps): JSX.Element => {
  const inputs = [
    { id: "1", inputGroup: inputGroup.id },
    { id: "2", inputGroup: inputGroup.id },
  ];
  const { t } = useTranslation();
  const [deleteInputGroups] = useApiInputGroupsDestroyMutation();

  const handleDeleteInputGroup = async () => {
    if (inputGroup) {
      try {
        await deleteInputGroups({ id: inputGroup.id }).unwrap();
      } catch (e) {
        //
      }
    }
  };

  const handleAddInput = () => {
    //
  };

  const classes = useStyles();
  return (
    <Paper className={classes.inputGroups} variant="outlined">
      {inputs.map((input) => (
        <div key={input.id} className={classes.div}>
          <Input input={input} />
        </div>
      ))}
      <Button
        size="small"
        variant="outlined"
        className={classes.button}
        startIcon={<Add />}
        onClick={handleAddInput}
      >
        <Typography>{t("addInput")}</Typography>
      </Button>
      <Button
        size="small"
        variant="outlined"
        className={clsx(classes.button, classes.deleteButton)}
        startIcon={
          <Icon icon={IconNames.TRASH} className={classes.iconDelete} />
        }
      >
        <Typography onClick={handleDeleteInputGroup}>
          {t("deleteGroup")}
        </Typography>
      </Button>
    </Paper>
  );
};

export default AttributeInputGroup;
