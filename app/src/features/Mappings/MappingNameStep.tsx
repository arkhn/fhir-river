import React from "react";

import {
  Container,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { store, useAppDispatch } from "../../app/store";
import { resourceSelectors, resourceUpdated } from "./resourceSlice";

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    paddingInline: theme.spacing(25),
    paddingBlock: theme.spacing(2),
  },
}));

const MappingNameStep = (): JSX.Element | null => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const resource = resourceSelectors.selectById(store.getState(), "0");

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (resource?.id)
      dispatch(
        resourceUpdated({
          id: resource.id,
          changes: { label: event.target.value },
        })
      );
  };

  if (!resource) return null;
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
          value={resource.label ?? ""}
          onChange={handleChangeName}
        />
      </div>
    </Container>
  );
};

export default MappingNameStep;
