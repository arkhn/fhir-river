import React, { useState } from "react";

import {
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
import Button from "common/components/Button";

import {
  useApiResourcesListQuery,
  useApiBatchesCreateMutation,
} from "services/api/endpoints";

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(0, 4, 1, 4),
    marginTop: `-${theme.spacing(3)}px`,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "50%",
  },
  button: {
    textTransform: "none",
    margin: theme.spacing(1),
    marginTop: "auto",
    marginBottom: "auto",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: theme.spacing(0.25),
  },
  mediumBold: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  regularBold: {
    fontWeight: theme.typography.fontWeightRegular,
  },
  menuPaper: {
    maxHeight: ITEM_HEIGHT * 4.5 + theme.spacing(1),
    width: 250,
  },
}));

const BatchCreate = (): JSX.Element => {
  const { t } = useTranslation();

  const classes = useStyles();

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

  const handleBatchRun = () => {
    const batchCreate = async () => {
      try {
        await apiBatchCreate({
          batchRequest: {
            resource_ids: selectedResourceIds,
          },
        }).unwrap();
      } catch (e) {
        setAlert(e.message as string);
      }
    };

    if (selectedResourceIds.length > 0) {
      batchCreate();
      setSelectedResourceIds([]);
    }
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-mutiple-chip-label">{t("resources")}</InputLabel>
        <Select
          variant="filled"
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
                      size="small"
                      key={`resource-selected-${resource.id}`}
                      label={`${resource.definition_id} - ${resource.label}`}
                      className={classes.chip}
                    />
                  )
                );
              })}
            </div>
          )}
          MenuProps={{
            PaperProps: {
              className: classes.menuPaper,
            },
            anchorOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
        >
          {resources &&
            resources.map(({ id, definition_id, label }) => (
              <MenuItem
                key={`resource-option-${id}`}
                value={id}
                classes={{
                  root: classes.mediumBold,
                  selected: classes.regularBold,
                }}
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
        startIcon={<PlayIcon />}
        onClick={handleBatchRun}
      >
        {t("run")}
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
