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
import CancelIcon from "@material-ui/icons/Cancel";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Pagination from "@material-ui/lab/Pagination";
import { useTranslation } from "react-i18next";

import {
  useApiBatchesDestroyMutation,
  useApiBatchesListQuery,
} from "services/api/endpoints";

import BatchErrors from "./BatchErrors";

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  button: {
    margin: theme.spacing(3),
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

  const { data: batches, isLoading: isBatchesLoading } = useApiBatchesListQuery(
    {}
  );
  const offset = (page - 1) * PAGE_SIZE;
  const limit = offset + PAGE_SIZE;
  const displayedBatches =
    batches &&
    batches
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(offset, limit);

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => {
    apiBatchesDestroy({ id: batchId });
  };

  if (isBatchesLoading) return <CircularProgress />;
  return (
    <>
      {displayedBatches &&
        displayedBatches
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
          .map((batch) => (
            <Accordion key={`batch-${batch.id}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>#{batch.id}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  endIcon={<CancelIcon />}
                  onClick={() => handleBatchCancel(batch.id)}
                >
                  <Typography>{t("cancel")}</Typography>
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <BatchErrors errors={batch.errors} />
              </AccordionDetails>
            </Accordion>
          ))}
      <Typography>Page: {page}</Typography>
      <Pagination count={PAGE_SIZE} page={page} onChange={handlePageChange} />
    </>
  );
};

export default BatchList;
