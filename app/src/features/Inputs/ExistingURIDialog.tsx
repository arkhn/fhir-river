import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import Select from "common/components/Select";
import { useApiSourcesListQuery } from "services/api/endpoints";
import { useApiSourcesExportRetrieveQuery } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(2),
  },
}));

type ExistingURIDialogProps = Omit<DialogProps, "onSubmit" | "onClose"> & {
  onSubmit: (staticValue: string) => void;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const ExistingURIDialog = ({
  onSubmit,
  ...props
}: ExistingURIDialogProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [source, setSource] = useState("");
  const [mapping, setMapping] = useState("");
  const { data: sources } = useApiSourcesListQuery({});
  const { data: mappings } = useApiSourcesExportRetrieveQuery(
    { id: source ?? "" },
    { skip: !source }
  );

  // Reset Mapping select when source changes
  useEffect(() => {
    setMapping("");
  }, [source]);

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClose && props.onClose(e);
  };
  const handleSourceChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => setSource(event.target.value as string);

  const handleMappingChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => setMapping(event.target.value as string);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedMapping = mappings?.resources?.find(
      ({ id }) => id === mapping
    );
    if (selectedMapping) {
      onSubmit(selectedMapping.logical_reference ?? "");
    }
    handleClose(e);
  };

  return (
    <Dialog
      maxWidth="sm"
      PaperProps={{ className: classes.root }}
      {...props}
      fullWidth
    >
      <DialogTitle>{t("chooseExistingURI")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Select
              value={source}
              options={
                sources?.map(({ name, id }) => ({ id, label: name })) ?? []
              }
              onChange={handleSourceChange}
              emptyOption={t("selectSource")}
            />
          </Grid>
          <Grid>
            <Select
              value={mapping}
              options={
                mappings?.resources?.map(({ label, id, definition_id }) => ({
                  id: id ?? "",
                  label: label && label !== "" ? label : definition_id,
                })) ?? []
              }
              onChange={handleMappingChange}
              emptyOption={t("selectMapping")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.button}
          disableRipple
          onClick={handleClose}
          color="inherit"
        >
          {t("cancel")}
        </Button>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          disabled={mapping === ""}
        >
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExistingURIDialog;
