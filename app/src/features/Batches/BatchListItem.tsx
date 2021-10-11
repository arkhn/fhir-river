import React, { useMemo } from "react";

import { Link, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

import { Batch } from "services/api/generated/api.generated";

import { KIBANA_URL } from "../../constants";
import BatchCancel from "./BatchCancel";

type BatchListItemType = {
  batch: Batch;
};

const useStyles = makeStyles((theme) => ({
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
    gap: theme.spacing(1),
  },
  title: {
    display: "flex",
  },
  link: {
    marginLeft: theme.spacing(1),
  },
}));

const createKibanaLink = (batchCreation: string, batchEnd: string) => {
  return `${KIBANA_URL}/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${batchCreation}',to:'${batchEnd}'))&_a=(columns:!(_source),filters:!(),interval:auto,query:(language:kuery,query:error),sort:!())`;
};

const BatchListItem = ({ batch }: BatchListItemType): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const batchEnd = batch.completed_at ?? batch.canceled_at;

  const isBatchInProgress = !batch.completed_at && !batch.canceled_at;
  const hasBatchCompletedWithErrors =
    batch.completed_at && batch.errors.length > 0;
  const hasBatchCompletedWithoutError =
    batch.completed_at && batch.errors.length === 0;
  const isBatchRunning = !batch.canceled_at && !batch.completed_at;
  const hasBatchStopped = batch.completed_at || batch.canceled_at;

  const batchDuration = useMemo(() => {
    if (batchEnd) {
      const { years, months, days, hours, minutes, seconds } = DateTime.fromISO(
        batchEnd
      )
        .diff(DateTime.fromISO(batch.created_at), [
          "years",
          "months",
          "days",
          "hours",
          "minutes",
          "seconds",
        ])
        .toObject();
      return `${years ? `${t("year", { count: years })} ` : ""}${
        months ? `${t("month", { count: months })} ` : ""
      }${days ? `${t("day", { count: days })} ` : ""}${
        hours ? `${t("hour", { count: hours })} ` : ""
      }${minutes ? `${t("minute", { count: minutes })} ` : ""}${
        seconds ? `${t("second", { count: seconds })} ` : ""
      }`;
    }
  }, [batch.created_at, batchEnd, t]);

  const getCreatedAtDate = (date: string) =>
    new Date(date).toLocaleString().split(",").join(" -");

  return (
    <Paper
      key={batch.id}
      className={classes.listItem}
      variant="outlined"
      elevation={2}
    >
      <div>
        <div className={classes.title}>
          <Typography variant="subtitle2">
            {isBatchInProgress && t("batchInProgress")}
            {hasBatchCompletedWithErrors &&
              t("batchErrors", {
                count: batch.errors.length,
              })}
            {(isBatchInProgress || hasBatchCompletedWithErrors) && (
              <Link
                className={classes.link}
                target="_blank"
                rel="noopener"
                href={createKibanaLink(
                  new Date(batch.created_at).toISOString(),
                  batchEnd ?? "now"
                )}
              >
                ({t("seeOnKibana")})
              </Link>
            )}
            {hasBatchCompletedWithoutError && t("batchSuccess")}
            {batch.canceled_at && t("batchCanceled")}
          </Typography>
        </div>
        {hasBatchStopped && (
          <Typography variant="body2" color="textSecondary">
            {`${batchDuration} | ${t("resourceWithCount", {
              count: batch.resources.length,
            })}`}
          </Typography>
        )}
      </div>
      <div className={classes.listItemActions}>
        <Typography variant="subtitle2">
          {getCreatedAtDate(batch.created_at)}
        </Typography>
        {isBatchRunning && <BatchCancel batch={batch} />}
      </div>
    </Paper>
  );
};

export default BatchListItem;
