import React, { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ExpandMore, Replay } from "@material-ui/icons";
import Pagination from "@material-ui/lab/Pagination";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import { useApiBatchesListQuery } from "services/api/endpoints";

import BatchCancel from "./BatchCancel";
import BatchErrors from "./BatchErrors";

const useStyles = makeStyles((theme) => ({
  accordionSummaryContent: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 0),
  },
  accordionSummary: {
    margin: 0,
    minHeight: 56,
    "& > .MuiAccordionSummary-content": {
      minHeight: 56,
      margin: 0,
      transition: "none",
      "&.Mui-expanded": {
        minHeight: 56,
      },
    },
    "&.MuiAccordionSummary-root": {
      borderBottom: `1px solid ${theme.palette.background.default}`,
      minHeight: 56,
      margin: 0,
      transition: "none",
    },
  },
  accordionSummaryTitle: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    textTransform: "none",
    marginLeft: theme.spacing(1),
  },
  accordionDetails: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  accordions: {
    margin: theme.spacing(0, 5, 8, 5),
  },
  accordion: {
    "&.Mui-expanded": {
      margin: 0,
      marginBottom: theme.spacing(0.5),
    },
    "&:before": {
      display: "none",
    },
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
  },
  batchId: {
    fontSize: theme.typography.subtitle2.fontSize,
    backgroundColor: theme.palette.divider,
    padding: theme.spacing(0, 0.5),
    borderRadius: 3,
    marginTop: theme.spacing(0.5),
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
  endButtons: {
    display: "flex",
  },
}));

const PAGE_SIZE = 10;

const BatchList = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();

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
      ordering: "-created_at",
    }
  );

  const handleBatchRetry = (batchId: string) => (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    // TODO: batch retry is not implemented yet
    console.log(batchId);
  };

  if (isBatchesLoading) return <CircularProgress />;
  return (
    <>
      <div className={classes.accordions}>
        {batches?.results &&
          batches.results.map((batch) => (
            <Accordion key={`batch-${batch.id}`} className={classes.accordion}>
              <AccordionSummary
                className={classes.accordionSummary}
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <div className={classes.accordionSummaryContent}>
                  <div className={classes.accordionSummaryTitle}>
                    <div>
                      <Typography variant="subtitle2">
                        {!batch.deleted_at && `⏳ In Progress...`}
                        {batch.deleted_at &&
                          batch.errors.length > 0 &&
                          `⚠️ ${batch.errors.length} errors`}
                        {batch.deleted_at &&
                          batch.errors.length === 0 &&
                          `✅ Success`}
                      </Typography>
                      <Typography className={classes.batchId}>
                        {batch.id}
                      </Typography>
                    </div>
                    <Typography variant="subtitle2">
                      {new Date(batch.created_at)
                        .toLocaleString()
                        .split(",")
                        .join(" -")}
                    </Typography>
                  </div>
                  <div className={classes.endButtons}>
                    <Button
                      className={classes.button}
                      variant="outlined"
                      startIcon={<Replay />}
                      onClick={handleBatchRetry(batch.id)}
                    >
                      {t("retry")}
                    </Button>
                    {!batch.deleted_at && (
                      <BatchCancel batch={batch} className={classes.button} />
                    )}
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <BatchErrors batch={batch} />
              </AccordionDetails>
            </Accordion>
          ))}
      </div>
      <div className={classes.paginationContainer}>
        <Pagination
          count={Math.ceil((batches?.results?.length ?? 1) / PAGE_SIZE)}
          page={page}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default BatchList;
