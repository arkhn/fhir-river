import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { PlayCircleOutline } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import BatchResourceDialog from "features/Batches/BatchResourceDialog";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(0, 4, 1, 4),
  },
  button: {
    margin: theme.spacing(0, 1, 1, 1),
  },
}));

const BatchCreate = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={handleOpenModal}
        className={classes.button}
        startIcon={<PlayCircleOutline />}
      >
        {t("runNewBatch")}
      </Button>
      <BatchResourceDialog open={open} onClose={handleCloseModal} />
    </div>
  );
};

export default BatchCreate;
