import React, { useState, useEffect, useMemo } from "react";

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  List,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import Button from "common/components/Button";
import {
  useApiBatchesCreateMutation,
  useApiResourcesListQuery,
} from "services/api/endpoints";

import BatchResourceListItem from "./BatchResourceListItem";

const useStyles = makeStyles((theme) => ({
  dialog: {
    padding: theme.spacing(3),
    height: 470,
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  checkboxForm: {
    cursor: "pointer",
  },
  textField: {
    padding: theme.spacing(0, 3),
  },
}));

type BatchResourceDialogType = {
  open: boolean;
  onClose: () => void;
};

const BatchResourceDialog = ({
  open,
  onClose,
}: BatchResourceDialogType): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { sourceId: id } = useParams<{ sourceId: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );
  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [displayedResources, setDisplayedResources] = useState(resources);

  const displayedResourcesIds = useMemo(
    () => displayedResources?.map(({ id }) => id),
    [displayedResources]
  );

  const areAllDisplayedResourcesSelected = useMemo(() => {
    if (displayedResourcesIds) {
      const selectedAndDisplayedResourcesId = selectedResourceIds.filter((id) =>
        displayedResourcesIds.includes(id)
      );
      return (
        displayedResourcesIds.length > 0 &&
        selectedAndDisplayedResourcesId.length === displayedResourcesIds.length
      );
    }
  }, [selectedResourceIds, displayedResourcesIds]);

  const isCheckboxIndeterminate = useMemo(() => {
    if (displayedResourcesIds) {
      const selectedAndDisplayedResourcesId = selectedResourceIds.filter((id) =>
        displayedResourcesIds.includes(id)
      );
      return (
        selectedAndDisplayedResourcesId.length > 0 &&
        selectedAndDisplayedResourcesId.length < displayedResourcesIds.length
      );
    }
  }, [selectedResourceIds, displayedResourcesIds]);

  const onCloseModal = () => {
    setSelectedResourceIds([]);
    onClose();
  };

  const handleSearchResource = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const searchValue = e.target.value.toLowerCase();
    setDisplayedResources(
      resources?.filter(
        ({ label, definition_id }) =>
          label?.toLowerCase().includes(searchValue) ||
          definition_id.toLowerCase().includes(searchValue)
      )
    );
  };

  const handleSelectResources = (id: string) => {
    if (selectedResourceIds.includes(id)) {
      setSelectedResourceIds(
        selectedResourceIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      setSelectedResourceIds([...selectedResourceIds, id]);
    }
  };

  const handleSelectAllClick = () => {
    if (displayedResourcesIds && selectedResourceIds.length === 0) {
      setSelectedResourceIds(displayedResourcesIds);
    } else if (areAllDisplayedResourcesSelected || isCheckboxIndeterminate) {
      const resourcesIdsToKeep = selectedResourceIds.filter(
        (id) => !displayedResourcesIds?.includes(id)
      );
      setSelectedResourceIds(resourcesIdsToKeep);
    } else if (displayedResourcesIds) {
      const newSelectedResourcesIds = selectedResourceIds.concat(
        displayedResourcesIds
      );
      setSelectedResourceIds(newSelectedResourcesIds);
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
        enqueueSnackbar(e.error, { variant: "error" });
      }
    };

    if (selectedResourceIds.length > 0) {
      batchCreate();
      onClose();
      setSelectedResourceIds([]);
    }
  };

  /**
   * If the dialog opening state or if the resources changes,
   * set displayed resources with all the resources of the source.
   */
  useEffect(() => {
    setDisplayedResources(resources);
  }, [resources, open]);

  return (
    <Dialog
      open={open}
      onClose={onCloseModal}
      classes={{ paper: classes.dialog }}
      fullWidth
    >
      <DialogTitle className={classes.title} disableTypography>
        <Typography variant="h6">{t("selectResources")}</Typography>
        <div
          onClick={handleSelectAllClick}
          className={clsx(classes.title, classes.checkboxForm)}
        >
          <Typography>
            {areAllDisplayedResourcesSelected || isCheckboxIndeterminate
              ? t("unselectResources")
              : t("selectAllResources")}
          </Typography>
          <Checkbox
            disabled={!displayedResourcesIds?.length}
            disableFocusRipple
            edge="end"
            color="primary"
            checked={areAllDisplayedResourcesSelected}
            indeterminate={isCheckboxIndeterminate}
          />
        </div>
      </DialogTitle>
      <TextField
        variant="outlined"
        size="small"
        classes={{ root: classes.textField }}
        fullWidth
        placeholder={t<string>("search")}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
        onChange={handleSearchResource}
      />
      <DialogContent>
        <List>
          {displayedResources?.length === 0 && (
            <Typography>{t("noAvailableResource")}</Typography>
          )}
          {displayedResources &&
            displayedResources.map((resource) => (
              <BatchResourceListItem
                resource={resource}
                onClick={handleSelectResources}
                key={resource.id}
                checked={selectedResourceIds.includes(resource.id)}
              />
            ))}
        </List>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={handleBatchRun}
          disabled={selectedResourceIds.length === 0}
        >
          {t("runOnResources", { count: selectedResourceIds.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchResourceDialog;
