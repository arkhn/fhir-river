import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  Typography,
  Checkbox,
  TextField,
  InputAdornment,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Search, PlayCircleOutline } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
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

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const [alert, setAlert] = useState<string | undefined>(undefined);

  const handleAlertClose = () => setAlert(undefined);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );
  const [displayedResources, setDisplayedResources] = useState(resources);
  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleBatchRun = () => {
    const batchCreate = async () => {
      try {
        await apiBatchCreate({
          batchRequest: {
            resource_ids: selectedResourceIds,
          },
        }).unwrap();
      } catch (e) {
        setAlert(e.message as string);
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
    setDisplayedResources(
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

  const isSelected = () => {
    const displayedResourcesIds = displayedResources?.map(
      (resource) => resource.id
    );
    if (
      selectedResourceIds.filter(
        (id) => id === displayedResourcesIds?.find((idList) => id === idList)
      ).length === displayedResourcesIds?.length &&
      displayedResourcesIds?.length > 0
    ) {
      return true;
    } else return false;
  };

  const getIndeterminateStatus = () => {
    const displayedResourcesIds = displayedResources?.map(
      (resource) => resource.id
    );
    if (
      displayedResourcesIds &&
      selectedResourceIds.filter(
        (id) => id === displayedResourcesIds?.find((idList) => id === idList)
      ).length < displayedResourcesIds?.length &&
      selectedResourceIds.filter(
        (id) => id === displayedResourcesIds?.find((idList) => id === idList)
      ).length > 0 &&
      selectedResourceIds.length > 0
    )
      return true;
    else return false;
  };

  const handleSelectAllResources = () => {
    if (selectedResourceIds.length === 0 && displayedResources) {
      setSelectedResourceIds(displayedResources.map((resource) => resource.id));
    } else {
      const resourcesToDelete = displayedResources
        ?.map((resource) => resource.id)
        ?.filter(
          (resource) =>
            resource ===
            selectedResourceIds.find(
              (selectedResourceId) => selectedResourceId === resource
            )
        );
      const indexToDelete: number[] = [];
      resourcesToDelete?.forEach((id) =>
        indexToDelete.push(selectedResourceIds.indexOf(id))
      );
      indexToDelete.sort((a, b) => b - a);
      const newSelectedResourceIds = [...selectedResourceIds];
      indexToDelete.forEach((index) => {
        newSelectedResourceIds.splice(index, 1);
      });
      setSelectedResourceIds(newSelectedResourceIds);
    }
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
    setDisplayedResources(resources);
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
      <Dialog
        open={open}
        onClose={() => {
          setSelectedResourceIds([]);
          setOpen(false);
        }}
        classes={{ paper: classes.dialog }}
        fullWidth
      >
        <div className={classes.header}>
          <div className={classes.titleContainer}>
            <DialogTitle className={classes.title}>
              {t("selectResources")}
            </DialogTitle>
            <div
              className={classes.selectAll}
              onClick={handleSelectAllResources}
            >
              <Typography>
                {isSelected() || getIndeterminateStatus()
                  ? t("unselectResources")
                  : t("selectResources")}
              </Typography>
              <Checkbox
                color="primary"
                checked={isSelected()}
                indeterminate={getIndeterminateStatus()}
              />
            </div>
          </div>
          <TextField
            variant="outlined"
            size="small"
            placeholder={t<string>("search")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={searchResource}
          />
        </div>
        <DialogContent dividers classes={{ root: classes.rootDialogContent }}>
          <List>
            {displayedResources &&
              displayedResources.length > 0 &&
              displayedResources.map(({ id, definition_id, label }) => (
                <ListItem
                  role={undefined}
                  key={`resource-option-${id}`}
                  button
                  onClick={() => handleSelectResources(id)}
                  classes={{ root: classes.rootListItem }}
                >
                  <ListItemIcon>
                    <Checkbox
                      color="primary"
                      checked={selectedResourceIds.includes(id)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${definition_id} ${label ? `- ${label}` : ""}`}
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={handleBatchRun}
          >
            <Typography>
              {`${t("runOn")} ${selectedResourceIds.length.toString()} ${t(
                "resources"
              ).toLowerCase()}`}
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </div>
  );
};

export default BatchCreate;
