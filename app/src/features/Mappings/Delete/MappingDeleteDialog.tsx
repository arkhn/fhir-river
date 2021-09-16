import React from "react";

import { DialogProps } from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { head } from "lodash";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import DeleteDialog from "common/components/DeleteDialog";
import { useApiResourcesDestroyMutation } from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import { ResourceRequest } from "services/api/generated/api.generated";

const MappingDeleteDialog = (props: DialogProps): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const [
    deleteMapping,
    { isLoading: isDeleteLoading },
  ] = useApiResourcesDestroyMutation({});

  const handleDelete = async () => {
    if (mappingId) {
      try {
        await deleteMapping({ id: mappingId }).unwrap();
        props.onClose && props.onClose({}, "escapeKeyDown");
        history.replace(`/sources/${sourceId}`);
      } catch (e) {
        const data = apiValidationErrorFromResponse<Partial<ResourceRequest>>(
          e as FetchBaseQueryError
        );
        enqueueSnackbar(head(data?.non_field_errors), { variant: "error" });
      }
    }
  };
  const handleClose = () => {
    props.onClose && props.onClose({}, "escapeKeyDown");
  };

  return (
    <>
      <DeleteDialog
        {...props}
        title={t("deleteMappingPrompt")}
        onClose={handleClose}
        onDelete={handleDelete}
        isLoading={isDeleteLoading}
      />
    </>
  );
};

export default MappingDeleteDialog;
