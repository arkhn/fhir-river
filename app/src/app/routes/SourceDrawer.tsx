import React from "react";

import { Drawer } from "@material-ui/core";
import { head } from "lodash";

import { useAppSelector } from "app/store";
import CredentialForm from "features/credentials/CredentialForm";
import CredentialOwnersSelect from "features/credentials/CredentialOwnersSelect";
import SourceForm from "features/sources/SourceForm";
import { selectSourceToEdit } from "features/sources/sourceSlice";
import { useApiCredentialsListQuery } from "services/api/endpoints";

const SourceDrawer = (): JSX.Element => {
  const sourceToEdit = useAppSelector(selectSourceToEdit);

  const isDrawerOpen = undefined !== sourceToEdit;

  const { isLoading, data: credentials } = useApiCredentialsListQuery(
    {
      source: sourceToEdit?.id,
    },
    { skip: !sourceToEdit }
  );
  const credential = head(credentials);

  return (
    <Drawer open={isDrawerOpen} anchor="right">
      <SourceForm source={sourceToEdit ?? undefined} />
      {!isLoading && <CredentialForm credential={credential} />}
      {!isLoading && credential && (
        <CredentialOwnersSelect credential={credential} />
      )}
    </Drawer>
  );
};

export default SourceDrawer;
