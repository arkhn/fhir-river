import React, { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Container,
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
  root: {
    display: "flex",
    flexDirection: "row",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  button: {
    margin: theme.spacing(1),
    marginTop: "auto",
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

  if (isBatchesLoading) return <CircularProgress />;
  return (
    <>
      {batches?.results &&
        batches.results.map((batch) => (
          <Accordion key={`batch-${batch.id}`}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div className={classes.root}>
                <Typography className={classes.heading}>
                  {batch.created_at}
                </Typography>
                {!batch.deleted_at && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    endIcon={<CancelIcon />}
                    onClick={handleBatchCancel(batch.id)}
                  >
                    <Typography>{t("cancel")}</Typography>
                  </Button>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Container>
                <Typography>
                  <b>ID</b>: {batch.id}
                </Typography>
                <BatchErrors batch={batch} />
              </Container>
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
