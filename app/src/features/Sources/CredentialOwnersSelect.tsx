import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import RefreshIcon from "@material-ui/icons/Refresh";
import Autocomplete from "@material-ui/lab/Autocomplete";
import type { AutocompleteChangeReason } from "@material-ui/lab/Autocomplete";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { difference, head } from "lodash";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import {
  useApiOwnersListQuery,
  useApiOwnersCreateMutation,
  useApiOwnersDestroyMutation,
  useApiOwnersPartialUpdateMutation,
} from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import type { Credential, Owner } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(3),
      minWidth: 400,
    },
    button: {
      marginBottom: theme.spacing(3),
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
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | undefined>(undefined);

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

  const [
    apiOwnersPartialUpdate,
    { isLoading: isUpdating },
  ] = useApiOwnersPartialUpdateMutation();

  const isLoading = isApiOwnersListLoading || isApiOwnerCreateLoading;

  const handleOwnerChange = async (
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
        if (!selectedOwnerName) return;
        try {
          await apiOwnersCreate({
            ownerRequest: {
              name: selectedOwnerName,
              credential: credential.id,
            },
          }).unwrap();
        } catch (e) {
          const data = apiValidationErrorFromResponse<Partial<Owner>>(
            e as FetchBaseQueryError
          );
          if (data?.non_field_errors)
            enqueueSnackbar(head(data.non_field_errors), { variant: "error" });
          if (data?.name) setError(head(data.name));
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
        if (removedOwner)
          await apiOwnersDestroy({ id: removedOwner.id }).unwrap();
        return;
    }
  };

  const handleRefreshSchemas = async () => {
    if (owners) {
      await Promise.all(
        owners.map((owner) =>
          apiOwnersPartialUpdate({
            id: owner.id,
            patchedOwnerRequest: {},
          }).unwrap()
        )
      );
    }
  };

  if (isLoading || isUpdating) return <CircularProgress />;
  return (
    <div className={classes.root}>
      <Button
        className={classes.button}
        onClick={handleRefreshSchemas}
        variant="outlined"
        startIcon={<RefreshIcon />}
      >
        {t("refreshSchemas")}
      </Button>

      <Autocomplete
        multiple
        options={availableOwnersNames}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Owners"
            error={!!error}
            helperText={error}
          />
        )}
        value={owners?.map((owner) => owner.name)}
        onChange={handleOwnerChange}
        disableClearable
      />
    </div>
  );
};

export default CredentialOwnersSelect;
