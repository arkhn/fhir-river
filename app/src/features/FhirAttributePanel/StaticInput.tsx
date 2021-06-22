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
    backgroundColor: "#444444",
    color: "#fff",
    borderRadius: 4,
    padding: "4px 8px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    width: "100%",
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
      //
    }
  };

  const handleStaticValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setStaticValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (staticValue !== input.static_value) {
      await updateInput({
        id: input.id,
        inputRequest: { ...input, static_value: staticValue },
      });
    }
  };

  return (
    <div className={classes.inputContainer}>
      <Grid container alignItems="center" direction="row" spacing={1}>
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
      </Grid>
      <IconButton size="small" onClick={handleDeleteInput}>
        <CloseRounded fontSize="small" />
      </IconButton>
    </div>
  );
};

export default StaticInput;
