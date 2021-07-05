import React from "react";

import { Button, ButtonProps, Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "app/store";
import { useApiSourcesRetrieveQuery } from "services/api/endpoints";

import { editCredential } from "./sourceSlice";

type SourceEditButtonProps = ButtonProps;

const CredentialEditButton = ({
  ...buttonProps
}: SourceEditButtonProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const { sourceId: id } = useParams<{ sourceId: string }>();
  const { data: source } = useApiSourcesRetrieveQuery({ id }, { skip: !id });
  const handleSourceEdit = () => {
    if (source) dispatch(editCredential(source));
  };

  return (
    <Button {...buttonProps} onClick={handleSourceEdit}>
      <Typography>Database settings</Typography>
    </Button>
  );
};

export default CredentialEditButton;
