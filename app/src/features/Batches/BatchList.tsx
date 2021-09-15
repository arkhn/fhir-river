import React, { useState } from "react";

import { CircularProgress, Link, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Replay } from "@material-ui/icons";
import Pagination from "@material-ui/lab/Pagination";
import moment, { Duration } from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import { useApiBatchesListQuery } from "services/api/endpoints";
import {
  ApiBatchesListApiResponse,
  Batch,
} from "services/api/generated/api.generated";

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
      completed_at: "2021-09-15T12:26:50.957411+02:00",
      created_at: "2021-09-10T10:59:32.000000+02:00",
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
      completed_at: "2021-09-11T22:28:50.957411+02:00",
      created_at: "2021-08-11T21:27:50.957411+02:00",
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

const createKibanaLink = (batchCreation: string) => {
  return `${KIBANA_URL}app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1y,to:now))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:ffb9f770-148b-11ec-afc5-23ae59245f97,key:'@timestamp',negate:!f,params:(query:'${batchCreation}'),type:phrase),query:(match_phrase:('@timestamp':'${batchCreation}')))),index:ffb9f770-148b-11ec-afc5-23ae59245f97,interval:auto,query:(language:kuery,query:''),sort:!())`;
};

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
  const {
    /* data: batches, */ isLoading: isBatchesLoading,
  } = useApiBatchesListQuery({
    limit,
    offset,
    source: [sourceId],
    ordering: "-created_at",
  });

  const getDurationString = (duration: number, unit: string) => {
    if (duration) return `${t(`${unit}`, { count: duration })} `;
    else return "";
  };

  const getBatchDuration = (batch: Batch) => {
    const batchEnd = batch.completed_at ?? batch.canceled_at;
    if (batchEnd) {
      const endTime = moment.utc(new Date(batchEnd));
      const duration: Duration = moment.duration(
        endTime.diff(new Date(batch.created_at))
      );
      return `${getDurationString(duration.years(), "year")}
      ${getDurationString(duration.months(), "month")}
      ${getDurationString(duration.days(), "day")}
      ${getDurationString(duration.hours(), "hour")}
      ${getDurationString(duration.minutes(), "minute")}
      `;
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
                          href={createKibanaLink(
                            new Date(batch.created_at).toISOString()
                          )}
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
