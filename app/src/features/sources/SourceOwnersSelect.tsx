import React from "react";

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { differenceBy } from "lodash";

import { useListOwnersQuery, useUpdateOwnerMutation } from "services/api/api";
import type { Owner } from "services/api/generated/api.generated";

import { useAppSelector } from "../../app/store";
import { selectSourceToEdit } from "./sourceSlice";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(3),
      minWidth: 400,
    },
  })
);

const SourceOwnersSelect = (): JSX.Element | null => {
  const classes = useStyles();

  const source = useAppSelector(selectSourceToEdit);
  if (!source?.id) return null;

  const { owners, selectedOwners, isOwnersLoading } = useListOwnersQuery(
    { source: source.id },
    {
      selectFromResult: ({ data, isLoading }) => ({
        owners: data,
        selectedOwners: data?.filter((owner) => !!owner.schema),
        isOwnersLoading: isLoading,
      }),
    }
  );
  const [updateOwner] = useUpdateOwnerMutation();

  const handleChange = (
    _: React.ChangeEvent<Record<string, never>>,
    value: Owner[],
    reason: string
  ) => {
    if (!selectedOwners) return;
    switch (reason) {
      case "select-option":
        const [selectedOwner] = differenceBy(value, selectedOwners, "id");
        if (selectedOwner?.id) {
          updateOwner({
            id: selectedOwner.id,
            owner: {
              ...selectedOwner,
              schema: undefined,
            },
          });
        }
        return;
      case "remove-option":
        const [removedOwner] = differenceBy(selectedOwners, value, "id");
        if (removedOwner?.id) {
          updateOwner({
            id: removedOwner.id,
            owner: {
              ...removedOwner,
              schema: null,
            },
          });
        }
        return;
    }
  };

  if (isOwnersLoading) return <CircularProgress />;
  return (
    <div className={classes.root}>
      <Autocomplete
        multiple
        options={owners || []}
        getOptionLabel={(owner) => owner.name}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Owners" />
        )}
        value={selectedOwners}
        onChange={handleChange}
      />
    </div>
  );
};

export default SourceOwnersSelect;
