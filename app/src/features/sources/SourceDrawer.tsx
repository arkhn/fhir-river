import React from "react";

import { Drawer } from "@material-ui/core";

import { useAppSelector } from "app/store";

import SourceCredentialForm from "./SourceCredentialForm";
import SourceForm from "./SourceForm";
import { selectSourceToCreate, selectSourceToUpdate } from "./sourceSlice";

const SourceDrawer = (): JSX.Element => {
  const sourceToCreate = useAppSelector(selectSourceToCreate);
  const sourceToUpdate = useAppSelector(selectSourceToUpdate);

  const isDrawerOpen = !!sourceToCreate || !!sourceToUpdate;

  return (
    <Drawer open={isDrawerOpen} anchor="right">
      <SourceForm sourceToUpdate={sourceToUpdate} />
      {sourceToUpdate && <SourceCredentialForm source={sourceToUpdate} />}
    </Drawer>
  );
};

export default SourceDrawer;
