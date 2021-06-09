import React, { useState } from "react";

import {
  Button,
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
import { useParams } from "react-router-dom";

import {
  useApiSourcesRetrieveQuery,
  useApiResourcesListQuery,
} from "services/api/endpoints";
import type { Resource } from "services/api/generated/api.generated";
import { useApiBatchCreateMutation } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  button: {
    margin: theme.spacing(3),
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
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

const getStyles = (resourceId: string, resources: Resource[], theme: Theme) => {
  return {
    fontWeight: resources.find(({ id }) => resourceId === id)
      ? theme.typography.fontWeightRegular
      : theme.typography.fontWeightMedium,
  };
};

const BatchCreate = (): JSX.Element => {
  const classes = useStyles();
  const theme = useTheme();

  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: source } = useApiSourcesRetrieveQuery(
    { id },
    { skip: !Boolean(id) }
  );

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );

  const [apiBatchCreate] = useApiBatchCreateMutation();

  const handleResourceSelectionChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setSelectedResources(event.target.value as Resource[]);
  };

  const handleBatchRun = () => {
    if (!selectedResources.length) return;

    apiBatchCreate({
      batchRequest: {
        resources: selectedResources.map(({ id }) => ({
          resource_id: id,
        })),
      },
    });
  };

  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-mutiple-chip-label">
          {source?.name ?? ""}
        </InputLabel>
        <Select
          labelId="demo-mutiple-chip-label"
          id="demo-mutiple-chip"
          multiple
          value={selectedResources}
          onChange={handleResourceSelectionChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {(selected as Resource[]).map((resource) => (
                <Chip
                  key={resource.id}
                  label={resource.label}
                  className={classes.chip}
                />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          {resources &&
            resources.map(({ id, definition_id }) => (
              <MenuItem
                key={definition_id}
                value={definition_id}
                style={getStyles(id, selectedResources, theme)}
              >
                {definition_id}
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
        Run
      </Button>
    </>
  );
};

export default BatchCreate;
