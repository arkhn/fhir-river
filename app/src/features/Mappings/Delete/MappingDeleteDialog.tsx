import React, { useState } from "react";

import { DialogProps } from "@material-ui/core";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { head } from "lodash";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import DeleteDialog from "common/components/DeleteDialog";
import { useApiResourcesDestroyMutation } from "services/api/endpoints";
import { apiValidationErrorFromResponse } from "services/api/errors";
import { ResourceRequest } from "services/api/generated/api.generated";

const MappingDeleteDialog = (props: DialogProps): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const [
    deleteMapping,
    { isLoading: isDeleteLoading },
  ] = useApiResourcesDestroyMutation({});

  const handleAlertClose = () => setAlert(undefined);
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
        setAlert(head(data?.non_field_errors));
      }
    }
  };
  const handleClose = () => {
    props.onClose && props.onClose({}, "escapeKeyDown");
  };

  return (
    <DeleteDialog
      {...props}
      title={t("deleteMappingPrompt")}
      onClose={handleClose}
      onDelete={handleDelete}
      loading={isDeleteLoading}
      alert={alert}
      onAlertClose={handleAlertClose}
    />
  );
};

export default MappingDeleteDialog;
