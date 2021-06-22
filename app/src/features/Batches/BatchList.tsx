import React, { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CancelOutlined, ExpandMore, Replay } from "@material-ui/icons";
import Pagination from "@material-ui/lab/Pagination";
import { useTranslation } from "react-i18next";

import {
  useApiBatchesDestroyMutation,
  useApiBatchesListQuery,
} from "services/api/endpoints";

import BatchErrors from "./BatchErrors";

const useStyles = makeStyles((theme) => ({
  accordionSummaryContent: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  pagination: {
    marginTop: theme.spacing(1),
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

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => () => {
    apiBatchesDestroy({ id: batchId });
  };

  const handleBatchRetry = (batchId: string) => () => {
    console.log(batchId);
    console.log("hey");
  };

  if (isBatchesLoading) return <CircularProgress />;
  return (
    <>
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
                <Typography variant="subtitle2">
                  {new Date(batch.created_at).toLocaleString()}
                </Typography>
                <div>
                  <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    startIcon={<Replay />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBatchRetry(batch.id);
                    }}
                  >
                    <Typography>{t("retry")}</Typography>
                  </Button>
                  {!batch.deleted_at && (
                    <Button
                      className={classes.button}
                      variant="contained"
                      color="primary"
                      startIcon={<CancelOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBatchCancel(batch.id);
                      }}
                    >
                      <Typography>{t("cancel")}</Typography>
                    </Button>
                  )}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Typography gutterBottom>
                <b>ID</b> : {batch.id}
              </Typography>
              <BatchErrors batch={batch} />
            </AccordionDetails>
          </Accordion>
        ))}
      <Pagination
        className={classes.pagination}
        count={Math.ceil((batches?.results?.length ?? 1) / PAGE_SIZE)}
        page={page}
        onChange={handlePageChange}
      />
    </>
  );
};

export default BatchList;
