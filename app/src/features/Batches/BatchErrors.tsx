import React from "react";

import { Typography } from "@material-ui/core";
import { DataGrid, GridCellParams } from "@material-ui/data-grid";
import { useTranslation } from "react-i18next";

import type { Batch } from "services/api/generated/api.generated";

type BatchErrorsProps = {
  batch: Batch;
};

const BatchErrors = ({ batch }: BatchErrorsProps): JSX.Element => {
  const { t } = useTranslation();

  const columns = [
    { field: "event", flex: 1, headerName: t("event") },
    { field: "message", flex: 1, headerName: t("message") },
    { field: "exception", flex: 1, headerName: t("exception") },
    {
      field: "created_at",
      flex: 1,
      headerName: t("createdAt"),
      renderCell: (params: GridCellParams) =>
        new Date(params.value as string).toLocaleString(),
    },
  ];

  return (
    <>
      <Typography gutterBottom>
        {t("errors", { count: batch.errors.length })}
      </Typography>
      <DataGrid
        showColumnRightBorder
        autoHeight
        rows={batch.errors}
        columns={columns}
        pageSize={5}
      />
    </>
  );
};

export default BatchErrors;
