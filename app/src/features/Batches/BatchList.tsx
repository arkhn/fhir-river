import React from "react";

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

import {
  useApiBatchesDestroyMutation,
  useApiBatchesListQuery,
} from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  button: {
    margin: theme.spacing(3),
  },
}));

const BatchList = (): JSX.Element => {
  const classes = useStyles();

  const { data: batches, isLoading: isBatchesLoading } = useApiBatchesListQuery(
    {}
  );

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => {
    apiBatchesDestroy({ id: batchId });
  };

  if (isBatchesLoading) return <CircularProgress />;
  return (
    <>
      {batches &&
        batches.map((batch) => (
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
                Cancel
              </Button>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
    </>
  );
};

export default BatchList;
