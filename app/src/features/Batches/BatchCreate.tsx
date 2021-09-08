import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { PlayCircleOutline } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import {
  useApiResourcesListQuery,
  useApiBatchesCreateMutation,
} from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(0, 4, 1, 4),
  },
  button: {
    margin: theme.spacing(0, 1, 1, 1),
  },
  selectAll: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  dialog: {
    padding: theme.spacing(3),
    height: 500,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    paddingLeft: 0,
  },
  titleButton: {
    marginTop: "auto",
    marginBottom: "auto",
  },
  rootDialogContent: {
    padding: 0,
  },
  rootListItem: {
    padding: 0,
    borderRadius: theme.shape.borderRadius,
  },
}));

const BatchCreate = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );
  const [resourceList, setResourceList] = useState(resources);

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => setOpen(true)}
        className={classes.button}
        startIcon={<PlayCircleOutline />}
      >
        {t("runNewBatch")}
      </Button>
    </div>
  );
};

export default BatchCreate;
