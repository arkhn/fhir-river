import React from "react";

import {
  Container,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import { Resource } from "services/api/generated/api.generated";

import { resourceUpdated } from "../resourceSlice";

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    paddingInline: theme.spacing(25),
    paddingBlock: theme.spacing(2),
  },
}));

type MappingNameStepProps = {
  mapping: Partial<Resource>;
};

const MappingNameStep = ({ mapping }: MappingNameStepProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (mapping.id)
      dispatch(
        resourceUpdated({
          id: mapping.id,
          changes: { label: event.target.value },
        })
      );
  };

  return (
    <Container maxWidth="md">
      <Typography align="center">{t("mappingNamePrompt")}</Typography>
      <Typography align="center" color="textSecondary">
        {t("optionalPrompt")}
      </Typography>
      <div className={classes.inputContainer}>
        <TextField
          variant="outlined"
          margin="dense"
          fullWidth
          placeholder={t("typeNameHere")}
          value={mapping.label ?? ""}
          onChange={handleChangeName}
        />
      </div>
    </Container>
  );
};

export default MappingNameStep;
