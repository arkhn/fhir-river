import React from "react";

import { Button, Container, makeStyles } from "@material-ui/core";
import { DataGrid, GridColDef, GridCellParams } from "@material-ui/data-grid";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "300px",
    width: "100%",
    marginTop: theme.spacing(3),
  },
}));

const Preview = (): JSX.Element => {
  const classes = useStyles();

  const cell = (params: GridCellParams) => (
    <strong>
      {(params.value as Date).getFullYear()}
      <Button
        variant="contained"
        color="primary"
        size="small"
        style={{ marginLeft: 16 }}
      >
        Open
      </Button>
    </strong>
  );

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Year",
      width: 150,
      renderCell: cell,
    },
  ];

  const rows = [
    {
      id: 1,
      date: new Date(1979, 0, 1),
    },
    {
      id: 2,
      date: new Date(1984, 1, 1),
    },
    {
      id: 3,
      date: new Date(1992, 2, 1),
    },
  ];

  return (
    <Container maxWidth={"lg"}>
      <div className={classes.root}>
        <DataGrid rows={rows} columns={columns} />
      </div>
    </Container>
  );
};

export default Preview;
