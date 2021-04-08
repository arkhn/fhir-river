import React from "react";

import { Drawer } from "@material-ui/core";

import { useAppDispatch, useAppSelector } from "app/store";
import CredentialForm from "features/Sources/CredentialForm";
import CredentialOwnersSelect from "features/Sources/CredentialOwnersSelect";
import SourceForm from "features/Sources/SourceForm";
import {
  selectSourceCurrent,
  selectIsSourceEditing,
  selectSourceCredential,
  selectIsSourceCredentialEditing,
  selectIsOwnersEditing,
  initSource,
} from "features/Sources/sourceSlice";

const SourceDrawer = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const source = useAppSelector(selectSourceCurrent);
  const isSourceEditing = useAppSelector(selectIsSourceEditing);

  const sourceCredential = useAppSelector(selectSourceCredential);
  const isSourceCredentialEditing = useAppSelector(
    selectIsSourceCredentialEditing
  );

  const isOwnersEditing = useAppSelector(selectIsOwnersEditing);

  const handleDrawerClose = () => dispatch(initSource());

  const isDrawerOpen =
    isSourceEditing || isSourceCredentialEditing || isOwnersEditing;

  return (
    <Drawer open={isDrawerOpen} onClose={handleDrawerClose} anchor="right">
      {isSourceEditing && <SourceForm />}
      {source && isSourceCredentialEditing && (
        <CredentialForm source={source} />
      )}
      {sourceCredential && (
        <CredentialOwnersSelect credential={sourceCredential} />
      )}
    </Drawer>
  );
};

export default SourceDrawer;
