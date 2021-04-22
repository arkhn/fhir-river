import React from "react";

import {
  Container,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    paddingInline: theme.spacing(25),
    paddingBlock: theme.spacing(2),
  },
}));

type MappingNameStepProps = {
  mapping: Partial<Resource>;
  onChange?: (mapping: Partial<Resource>) => void;
};

const MappingNameStep = ({
  mapping,
  onChange,
}: MappingNameStepProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange({ label: event.target.value });
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
