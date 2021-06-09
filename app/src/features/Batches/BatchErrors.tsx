import React from "react";

import { Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { useTranslation } from "react-i18next";

import type { Error } from "services/api/generated/api.generated";

type BatchErrorsProps = {
  errors: Error[];
};

const BatchErrors = ({ errors }: BatchErrorsProps): JSX.Element => {
  const { t } = useTranslation();

  const columns = [
    { field: "id", headerName: t("id") },
    { field: "event", headerName: t("event") },
    { field: "message", headerName: t("message") },
    { field: "exception", headerName: t("exception") },
    { field: "created_at", headerName: t("createdAt") },
    { field: "deleted_at", headerName: t("deletedAt") },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <Typography>{t("errors", { count: errors.length })}</Typography>
      <DataGrid rows={errors} columns={columns} pageSize={5} />
    </div>
  );
};

export default BatchErrors;
