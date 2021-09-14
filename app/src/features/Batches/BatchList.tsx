import React, { useState } from "react";

import { CircularProgress, Link, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Replay } from "@material-ui/icons";
import Pagination from "@material-ui/lab/Pagination";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import { useApiBatchesListQuery } from "services/api/endpoints";
import { Batch } from "services/api/generated/api.generated";

import { KIBANA_URL } from "../../constants";
import BatchCancel from "./BatchCancel";

const useStyles = makeStyles((theme) => ({
  batchList: {
    overflowY: "scroll",
    margin: theme.spacing(0, 5, 8, 5),
  },
  listItem: {
    marginBottom: theme.spacing(0.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1.3, 2, 1, 2),
    flexWrap: "wrap",
  },
  listItemActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
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
  margin: {
    marginRight: theme.spacing(1),
  },
  title: {
    display: "flex",
  },
}));

const PAGE_SIZE = 10;

const BatchList = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
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

  const convertDateToTime = (batchStart: string, batchEnd: string) => {
    const timeBatchStart = new Date(batchStart).getTime();
    const timeBatchEnd = new Date(batchEnd).getTime();
    const duration = timeBatchEnd - timeBatchStart;
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    return { hours, minutes };
  };

  const getBatchDuration = (batch: Batch) => {
    const batchEnd = batch.completed_at ?? batch.canceled_at;
    if (batchEnd) {
      const { hours, minutes } = convertDateToTime(batch.created_at, batchEnd);
      if (hours > 0 && minutes > 0) {
        return `${t("hour", { count: hours })} ${t("minute", {
          count: minutes,
        })}`;
      } else if (hours > 0 && minutes === 0) {
        return t("hour", { count: hours });
      } else {
        return t("minute", { count: minutes });
      }
    }
  };

  const getCreatedAtDate = (date: string) =>
    new Date(date).toLocaleString().split(",").join(" -");

  const handleBatchRetry = (batchId: string) => (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    // TODO: batch retry is not implemented yet
    console.log(batchId);
  };

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
            <Paper
              key={batch.id}
              className={classes.listItem}
              variant="outlined"
              elevation={2}
            >
              <div>
                <div className={classes.title}>
                  <Typography variant="subtitle2">
                    {!batch.completed_at &&
                      !batch.canceled_at &&
                      t("batchInProgress")}
                    {batch.completed_at && batch.errors.length > 0 && (
                      <>
                        {t("batchErrors", {
                          count: batch.errors.length,
                        })}{" "}
                        <Link
                          target="_blank"
                          rel="noopener"
                          href={`${KIBANA_URL}app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1y,to:now))&_a=(columns:!(_source),filters:!(),interval:auto,query:(language:kuery,query:${batch.id}),sort:!())`}
                        >
                          ({t("seeOnKibana")})
                        </Link>
                      </>
                    )}

                    {batch.completed_at &&
                      batch.errors.length === 0 &&
                      t("batchSuccess")}
                    {batch.canceled_at && t("batchCanceled")}
                  </Typography>
                </div>
                {(batch.completed_at || batch.canceled_at) && (
                  <Typography variant="body2" color="textSecondary">
                    {`${getBatchDuration(batch)} | ${t("resource", {
                      count: batch.resources.length,
                    })}`}
                  </Typography>
                )}
              </div>
              <div className={classes.listItemActions}>
                <Typography variant="subtitle2" className={classes.margin}>
                  {getCreatedAtDate(batch.created_at)}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Replay />}
                  onClick={handleBatchRetry(batch.id)}
                  className={classes.margin}
                >
                  {t("retry")}
                </Button>
                {!batch.canceled_at && !batch.completed_at && (
                  <BatchCancel batch={batch} />
                )}
              </div>
            </Paper>
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
