import React from "react";

import { Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

import type { Error } from "services/api/generated/api.generated";

type BatchErrorsProps = {
  errors: Error[];
};

const BatchErrors = ({ errors }: BatchErrorsProps): JSX.Element => {
  const columns = [
    { field: "id", headerName: "ID" },
    { field: "event", headerName: "Event" },
    { field: "message", headerName: "Message" },
    { field: "exception", headerName: "Exception" },
    { field: "created_at", headerName: "Created At" },
    { field: "deleted_at", headerName: "Stopped At" },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <Typography>{errors.length} errors recorded</Typography>
      <DataGrid rows={errors} columns={columns} pageSize={5} />
    </div>
  );
};

export default BatchErrors;
