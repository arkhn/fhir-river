import React, { useState } from "react";

import {
  Button,
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
import {
  useApiResourcesListQuery,
  useApiBatchesCreateMutation,
} from "services/api/endpoints";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  button: {
    margin: theme.spacing(1),
    marginTop: "auto",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  mediumBold: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  regularBold: {
    fontWeight: theme.typography.fontWeightRegular,
  },
  menuPaper: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250,
  },
}));

const BatchCreate = (): JSX.Element => {
  const { t } = useTranslation();

  const classes = useStyles();

  const MenuProps = {
    PaperProps: {
      className: classes.menuPaper,
    },
  };

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );

  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleResourceSelectionChange = (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>
  ) => {
    setSelectedResourceIds(event.target.value as string[]);
  };

  const handleBatchRun = async () => {
    try {
      await apiBatchCreate({
        batchRequest: {
          resources: selectedResourceIds.map((id) => ({
            resource_id: id,
          })),
        },
      }).unwrap();

      setSelectedResourceIds([]);
    } catch (e) {
      setAlert(e as string);
    }
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-mutiple-chip-label">{t("resources")}</InputLabel>
        <Select
          labelId="demo-mutiple-chip-label"
          id="demo-mutiple-chip"
          multiple
          value={selectedResourceIds}
          onChange={handleResourceSelectionChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {(selected as string[]).map((resourceId) => {
                const resource = resources?.find(({ id }) => resourceId === id);
                return (
                  resource && (
                    <Chip
                      key={`resource-selected-${resource.id}`}
                      label={`${resource.definition_id} - ${resource.label}`}
                      className={classes.chip}
                    />
                  )
                );
              })}
            </div>
          )}
          MenuProps={MenuProps}
        >
          {resources &&
            resources.map(({ id, definition_id, label }) => (
              <MenuItem
                key={`resource-option-${id}`}
                value={id}
                className={clsx(classes.mediumBold, {
                  [classes.regularBold]: selectedResourceIds.includes(id),
                })}
              >
                {definition_id} - {label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        disabled={!selectedResourceIds.length}
        className={classes.button}
        endIcon={<PlayIcon />}
        onClick={handleBatchRun}
      >
        <Typography>{t("run")}</Typography>
      </Button>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </div>
  );
};

export default BatchCreate;
