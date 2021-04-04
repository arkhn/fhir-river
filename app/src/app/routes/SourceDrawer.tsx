import React from "react";

import { Drawer } from "@material-ui/core";
import { head } from "lodash";

import { useAppDispatch, useAppSelector } from "app/store";
import CredentialForm from "features/credentials/CredentialForm";
import CredentialOwnersSelect from "features/credentials/CredentialOwnersSelect";
import SourceForm from "features/sources/SourceForm";
import { selectSourceToEdit, editSource } from "features/sources/sourceSlice";
import { useApiCredentialsListQuery } from "services/api/endpoints";

const SourceDrawer = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const sourceToEdit = useAppSelector(selectSourceToEdit);

  const { isLoading, data: credentials } = useApiCredentialsListQuery(
    {
      source: sourceToEdit?.id,
    },
    { skip: !sourceToEdit }
  );
  const credential = (sourceToEdit ?? undefined) && head(credentials);

  const isDrawerOpen = undefined !== sourceToEdit;
  const handleCloseDrawer = () => dispatch(editSource(undefined));

  return (
    <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor="right">
      <SourceForm source={sourceToEdit ?? undefined} />
      {!isLoading && sourceToEdit && (
        <CredentialForm source={sourceToEdit} credential={credential} />
      )}
      {!isLoading && credential && (
        <CredentialOwnersSelect credential={credential} />
      )}
    </Drawer>
  );
};

export default SourceDrawer;
