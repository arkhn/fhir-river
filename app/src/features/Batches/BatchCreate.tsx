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
  useTheme,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import {
  useApiResourcesListQuery,
  useApiBatchesCreateMutation,
} from "services/api/endpoints";
import type { Resource } from "services/api/generated/api.generated";

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
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const getStyles = (resourceId: string, resourceIds: string[], theme: Theme) => {
  return {
    fontWeight: resourceIds.includes(resourceId)
      ? theme.typography.fontWeightRegular
      : theme.typography.fontWeightMedium,
  };
};

const BatchCreate = (): JSX.Element => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );

  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleResourceSelectionChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setSelectedResourceIds(event.target.value as string[]);
  };

  const handleBatchRun = () => {
    if (!selectedResourceIds.length) return;

    apiBatchCreate({
      batchRequest: {
        resources: selectedResourceIds.map((id) => ({
          resource_id: id,
        })),
      },
    });

    setSelectedResourceIds([]);
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
              {(selected as string[])
                .map<Resource | undefined>((resourceId) =>
                  resources?.find(({ id }) => resourceId === id)
                )
                .map(
                  (resource) =>
                    resource && (
                      <Chip
                        key={`resource-selected-${resource.id}`}
                        label={`${resource.definition_id} - ${resource.label}`}
                        className={classes.chip}
                      />
                    )
                )}
            </div>
          )}
          MenuProps={MenuProps}
        >
          {resources &&
            resources.map(({ id, definition_id, label }) => (
              <MenuItem
                key={`resource-option-${id}`}
                value={id}
                style={getStyles(id, selectedResourceIds, theme)}
              >
                {definition_id} - {label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        endIcon={<PlayIcon />}
        onClick={handleBatchRun}
      >
        <Typography>{t("run")}</Typography>
      </Button>
    </div>
  );
};

export default BatchCreate;
