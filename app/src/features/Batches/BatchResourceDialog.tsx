import React, { useState, useEffect } from "react";

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import Button from "common/components/Button";
import {
  useApiBatchesCreateMutation,
  useApiResourcesListQuery,
} from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
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

type BatchResourceDialogType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const BatchResourceDialog = ({
  open,
  setOpen,
  setAlert,
}: BatchResourceDialogType): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );
  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const [displayedResources, setDisplayedResources] = useState(resources);

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

  const handleBatchRun = () => {
    const batchCreate = async () => {
      try {
        await apiBatchCreate({
          batchRequest: {
            resources: selectedResourceIds,
          },
        }).unwrap();
      } catch (e) {
        setAlert(e.message as string);
      }
    };

    if (selectedResourceIds.length > 0) {
      batchCreate();
      setOpen(false);
      setSelectedResourceIds([]);
    }
  };
  useEffect(() => {
    setDisplayedResources(resources);
  }, [resources]);

  return (
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
          <div className={classes.selectAll} onClick={handleSelectAllResources}>
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
          disabled={selectedResourceIds.length === 0}
        >
          {`${t("runOn")} ${selectedResourceIds.length.toString()} ${t(
            "resources"
          ).toLowerCase()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchResourceDialog;
