import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import type { AutocompleteChangeReason } from "@material-ui/lab/Autocomplete";
import { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";
import { difference, head } from "lodash";

import Alert from "common/components/Alert";
import {
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
} from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import type { Credential, Owner } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(3),
      minWidth: 400,
    },
  })
);

type CredentialOwnersSelectProps = {
  credential: Credential;
};

const CredentialOwnersSelect = ({
  credential,
}: CredentialOwnersSelectProps): JSX.Element => {
  const classes = useStyles();

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);

  const availableOwnersNames = credential.available_owners;

  const {
    isLoading: isApiOwnersListLoading,
    data: owners,
  } = useApiOwnersListQuery({
    credential: credential.id,
  });
  const [
    apiOwnersCreate,
    { isLoading: isApiOwnerCreateLoading },
  ] = useApiOwnersCreateMutation();
  const [apiOwnersDestroy] = useApiOwnersDestroyMutation();

  const isLoading = isApiOwnersListLoading || isApiOwnerCreateLoading;

  const handleOwnerChange = (
    _: React.ChangeEvent<Record<string, never>>,
    value: string[],
    reason: AutocompleteChangeReason
  ) => {
    if (!owners) return;
    switch (reason) {
      case "select-option":
        const [selectedOwnerName] = difference(
          value,
          owners.map((owner) => owner.name)
        );
        // TODO: handle failure
        try {
          apiOwnersCreate({
            ownerRequest: {
              name: selectedOwnerName,
              credential: credential.id,
            },
          });
        } catch (e) {
          const data = apiValidationErrorFromResponse<Partial<Owner>>(
            e as FetchBaseQueryError
          );
          setAlert(head(data?.nonFieldErrors));
        }
        return;
      case "remove-option":
        const [removedOwnerName] = difference(
          owners.map((owner) => owner.name),
          value
        );
        const removedOwner = owners.find(
          (owner) => owner.name === removedOwnerName
        );
        if (removedOwner) apiOwnersDestroy({ id: removedOwner.id });
        return;
    }
  };

  if (isLoading) return <CircularProgress />;
  return (
    <div className={classes.root}>
      <Autocomplete
        multiple
        options={availableOwnersNames}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Owners" />
        )}
        value={owners?.map((owner) => owner.name)}
        onChange={handleOwnerChange}
        disableClearable
      />
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </div>
  );
};

export default CredentialOwnersSelect;
