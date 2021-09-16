import React from "react";

import { Link, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Replay } from "@material-ui/icons";
import moment, { Duration } from "moment";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
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
  },
  margin: {
    marginRight: theme.spacing(1),
  },
  title: {
    display: "flex",
  },
}));

const createKibanaLink = (batchCreation: string, batchEnd: string) => {
  return `${KIBANA_URL}/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${batchCreation}',to:'${batchEnd}'))&_a=(columns:!(_source),filters:!(),interval:auto,query:(language:kuery,query:error),sort:!())`;
};

const BatchListItem = ({ batch }: BatchListItemType): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const batchEnd = batch.completed_at ?? batch.canceled_at;

  const getDurationString = (duration: number, unit: string) => {
    if (duration) return `${t(`${unit}`, { count: duration })} `;
    else return "";
  };

  const getBatchDuration = (batch: Batch) => {
    if (batchEnd) {
      const endTime = moment.utc(new Date(batchEnd));
      const duration: Duration = moment.duration(
        endTime.diff(new Date(batch.created_at))
      );
      return `${getDurationString(duration.years(), "year")}${getDurationString(
        duration.months(),
        "month"
      )}${getDurationString(duration.days(), "day")}${getDurationString(
        duration.hours(),
        "hour"
      )}${getDurationString(duration.minutes(), "minute")}${getDurationString(
        duration.seconds(),
        "second"
      )}`;
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
            {!batch.completed_at && !batch.canceled_at && t("batchInProgress")}
            {batch.completed_at && batch.errors.length > 0 && (
              <>
                {t("batchErrors", {
                  count: batch.errors.length,
                })}
                {batchEnd && (
                  <Link
                    target="_blank"
                    rel="noopener"
                    href={createKibanaLink(
                      new Date(batch.created_at).toISOString(),
                      new Date(batchEnd).toISOString()
                    )}
                  >
                    ({t("seeOnKibana")})
                  </Link>
                )}
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
  );
};

export default BatchListItem;
