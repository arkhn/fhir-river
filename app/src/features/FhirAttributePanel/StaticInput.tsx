import React, { useState } from "react";

import {
  Grid,
  IconButton,
  makeStyles,
  Typography,
  TextField,
} from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import {
  useApiInputsDestroyMutation,
  useApiInputsUpdateMutation,
} from "services/api/endpoints";
import { Input as InputType } from "services/api/generated/api.generated";

type InputProps = {
  input: InputType;
};

const useStyles = makeStyles((theme) => ({
  static: {
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.getContrastText(theme.palette.grey[800]),
    borderRadius: 4,
    padding: "4px 8px",
  },
  iconButtonContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
}));

const StaticInput = ({ input }: InputProps): JSX.Element => {
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
      <Grid item>
        <Typography className={classes.static}>{t("static")}</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder={t("typeValue")}
          value={staticValue}
          onChange={handleStaticValueChange}
          onBlur={handleInputBlur}
        />
      </Grid>
      <Grid item className={classes.iconButtonContainer}>
        <IconButton size="small" onClick={handleDeleteInput}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default StaticInput;
