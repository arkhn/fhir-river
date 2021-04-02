import React from "react";

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import type { AutocompleteChangeReason } from "@material-ui/lab/Autocomplete";
import { differenceBy } from "lodash";

import {
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
  useApiOwnersListQuery,
  useApiCredentialsRetrieveQuery,
} from "services/api/api";
import type { Owner } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(3),
      minWidth: 400,
    },
  })
);

type CredentialOwnersSelectProps = {
  credentialId: string;
};

const CredentialOwnersSelect = ({
  credentialId,
}: CredentialOwnersSelectProps): JSX.Element => {
  const classes = useStyles();

  const {
    isLoading: isRetrieveCredentialLoading,
    data: credential,
  } = useApiCredentialsRetrieveQuery({ id: credentialId });
  const credentialOwners = credential?.owners;

  const {
    isLoading: isListOwnersLoading,
    data: owners,
  } = useApiOwnersListQuery({
    credential: credentialId,
  });
  const [
    createOwner,
    { isLoading: isCreateOwnerLoading },
  ] = useApiOwnersCreateMutation();
  const [deleteOwner] = useApiOwnersDestroyMutation();

  const handleChange = (
    _: React.ChangeEvent<Record<string, never>>,
    value: Owner[],
    reason: AutocompleteChangeReason
  ) => {
    if (!selectedOwners) return;
    switch (reason) {
      case "select-option":
        const [selectedOwner] = differenceBy(value, selectedOwners, "id");
        if (selectedOwner?.id) {
          createOwner({ owner: selectedOwner });
        }
        return;
      case "remove-option":
        const [removedOwner] = differenceBy(selectedOwners, value, "id");
        if (removedOwner?.id) {
          deleteOwner({ id: removedOwner.id });
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
        value={owners}
        onChange={handleChange}
      />
    </div>
  );
};

export default CredentialOwnersSelect;
