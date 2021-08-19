import React, { useState } from "react";

import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
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
  menuItem: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  menuPaper: {
    maxHeight: ITEM_HEIGHT * 4.5 + theme.spacing(1),
    width: 250,
  },
  select: {
    padding: theme.spacing(1.3),
  },
  label: {
    transform: "translate(14px, 12px) scale(1)",
  },
  selectedValue: {},
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

  const handleBatchRun = async () => {
    try {
      await apiBatchCreate({
        batchRequest: {
          resources: selectedResourceIds,
        },
      }).unwrap();

      setSelectedResourceIds([]);
    } catch (e) {
      setAlert(e.message as string);
    }
  };

  return (
    <div className={classes.root}>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel
          classes={{
            root: classes.label,
          }}
          id="resources"
        >
          {t("resources")}
        </InputLabel>
        <Select
          multiple
          labelId="resources"
          id="resources"
          label={t("resources")}
          value={selectedResourceIds}
          onChange={handleResourceSelectionChange}
          renderValue={(selected) =>
            (selected as string[]).map((resourceId) => {
              const resource = resources?.find(({ id }) => resourceId === id);
              return `${resource?.definition_id} - ${resource?.label}${
                (selected as string[]).length > 1 ? "," : ""
              } `;
            })
          }
          classes={{
            root: classes.select,
          }}
          MenuProps={{
            PaperProps: {
              className: classes.menuPaper,
            },
            anchorOrigin: {
              vertical: "bottom",
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
                  root: classes.menuItem,
                }}
              >
                <Checkbox
                  color="primary"
                  checked={selectedResourceIds.indexOf(id) > -1}
                />
                <ListItemText primary={`${definition_id} - ${label}`} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        size="large"
        disabled={!selectedResourceIds.length}
        className={classes.button}
        startIcon={<PlayIcon />}
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
