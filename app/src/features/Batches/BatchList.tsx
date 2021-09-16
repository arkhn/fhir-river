import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";
import { useParams } from "react-router-dom";

import { useApiBatchesListQuery } from "services/api/endpoints";

import BatchListItem from "./BatchListItem";

const useStyles = makeStyles((theme) => ({
  batchList: {
    overflowY: "scroll",
    margin: theme.spacing(0, 5, 8, 5),
  },
  paginationContainer: {
    backgroundColor: theme.palette.background.default,
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: theme.spacing(7),
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(5),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
}));

const PAGE_SIZE = 10;

const BatchList = (): JSX.Element => {
  const classes = useStyles();
  const { sourceId } = useParams<{ sourceId: string }>();

  const [page, setPage] = useState(1);
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const offset = (page - 1) * PAGE_SIZE;
  const limit = offset + PAGE_SIZE;
  const { data: batches, isLoading: isBatchesLoading } = useApiBatchesListQuery(
    {
      limit,
      offset,
      source: [sourceId],
      ordering: "-created_at",
    }
  );

  if (isBatchesLoading)
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  return (
    <>
      <div className={classes.batchList}>
        {batches?.results &&
          batches.results.map((batch) => (
            <BatchListItem key={batch.id} batch={batch} />
          ))}
      </div>
      <div className={classes.paginationContainer}>
        <Pagination
          count={Math.ceil((batches?.count ?? 1) / PAGE_SIZE)}
          page={page}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default BatchList;
