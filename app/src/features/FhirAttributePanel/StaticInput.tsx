import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, IconButton, makeStyles, TextField } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import {
  useApiInputsDestroyMutation,
  useApiInputsUpdateMutation,
} from "services/api/endpoints";
import { Input } from "services/api/generated/api.generated";

type StaticInputProps = {
  input: Input;
};

const useStyles = makeStyles((theme) => ({
  iconButtonContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
    },
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  input: {
    maxWidth: 534,
  },
  inputStartAdornment: {
    fill: theme.palette.text.disabled,
    marginRight: theme.spacing(1),
    height: theme.spacing(2),
  },
  primaryColor: {
    fill: theme.palette.primary.main,
  },
}));

const StaticInput = ({ input }: StaticInputProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [staticValue, setStaticValue] = useState(input.static_value ?? "");
  const [deleteInput] = useApiInputsDestroyMutation();
  const [updateInput] = useApiInputsUpdateMutation();

  const handleDeleteInput = async () => {
    try {
      await deleteInput({ id: input.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStaticValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setStaticValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (staticValue !== input.static_value) {
      try {
        await updateInput({
          id: input.id,
          inputRequest: { ...input, static_value: staticValue },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Grid container item alignItems="center" direction="row" spacing={1}>
      <Grid item xs={10}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder={t("typeStaticValueHere")}
          value={staticValue}
          onChange={handleStaticValueChange}
          onBlur={handleInputBlur}
          InputProps={{
            startAdornment: (
              <Icon
                icon={IconNames.ALIGN_LEFT}
                className={clsx(classes.inputStartAdornment, {
                  [classes.primaryColor]: !!staticValue,
                })}
              />
            ),
            className: classes.input,
          }}
        />
      </Grid>
      <Grid item className={classes.iconButtonContainer}>
        <IconButton
          size="small"
          className={classes.iconButton}
          onClick={handleDeleteInput}
        >
          <Icon icon={IconNames.TRASH} className={classes.icon} />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default StaticInput;
