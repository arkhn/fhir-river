import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";
import { useParams } from "react-router-dom";

import { useApiBatchesListQuery } from "services/api/endpoints";
import { ApiBatchesListApiResponse } from "services/api/generated/api.generated";

import BatchListItem from "./BatchListItem";

const batches: ApiBatchesListApiResponse = {
  count: 5,
  next:
    "http://localhost:8000/api/batches/?limit=10&offset=10&ordering=-created_at&source=ckssxtgmk00080ro4bdw44gqe",
  previous: null,
  results: [
    {
      canceled_at: null,
      completed_at: null,
      created_at: "2021-09-10T12:26:49.957411+02:00",
      errors: [],
      id: "ckte7t2p000090qt6uimwv7k6",
      resources: ["ckssyuqfp00080so06hm7l173"],
      updated_at: "2021-09-10T12:26:49.957471+02:00",
    },
    {
      canceled_at: "2021-09-10T14:37:51.957411+02:00",
      completed_at: null,
      created_at: "2021-09-10T12:26:49.957411+02:00",
      errors: [],
      id: "ckte7t2p000090qt6uimwv7k7",
      resources: ["ckssyuqfp00080so06hm7l173"],
      updated_at: "2021-09-10T12:26:49.957471+02:00",
    },
    {
      canceled_at: null,
      completed_at: "2021-09-10T12:33:50.957411+02:00",
      created_at: "2021-09-10T12:26:49.957411+02:00",
      errors: [],
      id: "ckte7t2p000090qt6uimwv7k8",
      resources: ["ckssyuqfp00080so06hm7l173"],
      updated_at: "2021-09-10T12:26:49.957471+02:00",
    },
    {
      canceled_at: null,
      completed_at: "2021-09-10T12:26:50.957411+02:00",
      created_at: "2021-09-10T12:26:49.957411+02:00",
      errors: [
        {
          id: "1",
          event: "string",
          created_at: "string",
          updated_at: "string",
          batch: "string",
        },
      ],
      id: "ckte7t2p000090qt6uimwv7k9",
      resources: [
        "ckssyuqfp00080so06hm7l173",
        "ckssyuqfp00080so06hm7l173",
        "ckssyuqfp00080so06hm7l173",
        "ckssyuqfp00080so06hm7l173",
      ],
      updated_at: "2021-09-10T12:26:49.957471+02:00",
    },
    {
      canceled_at: null,
      completed_at: "2021-09-10T12:27:50.957411+02:00",
      created_at: "2021-09-10T12:26:49.957411+02:00",
      errors: [
        {
          id: "1",
          event: "string",
          created_at: "string",
          updated_at: "string",
          batch: "string",
        },
        {
          id: "2",
          event: "string",
          created_at: "string",
          updated_at: "string",
          batch: "string",
        },
      ],
      id: "ckt4ia0jn00000lkkh2b9rrh9",
      resources: ["ckssyuqfp00080so06hm7l173", "ckssyuqfp00080so06hm7l173"],
      updated_at: "2021-09-10T12:26:49.957471+02:00",
    },
  ],
};

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
  const {
    /* data: batches, */ isLoading: isBatchesLoading,
  } = useApiBatchesListQuery({
    limit,
    offset,
    source: [sourceId],
    ordering: "-created_at",
  });

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
