import React, { useEffect, useState } from "react";

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

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(0, 4, 1, 4),
    marginTop: `-${theme.spacing(3)}px`,
  },
  button: {
    textTransform: "none",
    margin: theme.spacing(1),
    marginTop: "auto",
    marginBottom: "auto",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  selectAll: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  chip: {
    margin: theme.spacing(0.25),
  },
  mediumBold: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  regularBold: {
    fontWeight: theme.typography.fontWeightRegular,
  },
  menuPaper: {
    maxHeight: ITEM_HEIGHT * 4.5 + theme.spacing(1),
    width: 250,
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
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );
  const [resourceList, setResourceList] = useState(resources);
  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleBatchRun = () => {
    const batchCreate = async () => {
      try {
        await apiBatchCreate({
          batchRequest: {
            resources: selectedResourceIds,
          },
        }).unwrap();
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
    };

    if (selectedResourceIds.length > 0) {
      batchCreate();
      setSelectedResourceIds([]);
    }
  };

  const searchResource = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setResourceList(
      resources?.filter(
        (resource) =>
          resource.label
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          resource.definition_id
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleSelectAllResources = () => {
    if (resources)
      setSelectedResourceIds(
        selectedResourceIds.length === resources.length
          ? []
          : resources?.map((resource) => resource.id)
      );
  };

  const handleSelectResources = (id: string) => {
    if (!selectedResourceIds.find((resourceId) => resourceId === id)) {
      setSelectedResourceIds([...selectedResourceIds, id]);
    } else {
      const index = selectedResourceIds.indexOf(id);
      const newSelectedResourceIds = [...selectedResourceIds];
      newSelectedResourceIds.splice(index, 1);
      setSelectedResourceIds(newSelectedResourceIds);
    }
  };

  useEffect(() => {
    setResourceList(resources);
  }, [resources]);

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
