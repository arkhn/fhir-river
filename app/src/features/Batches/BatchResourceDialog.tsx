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
  handleClose: React.Dispatch<React.SetStateAction<boolean>>;
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const BatchResourceDialog = ({
  open,
  handleClose,
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
  const displayedResourcesIds = useMemo(
    () => displayedResources?.map(({ id }) => id),
    [displayedResources]
  );

  const areAllDisplayedResourcesSelected = useMemo(() => {
    return (
      displayedResourcesIds &&
      displayedResourcesIds.length > 0 &&
      selectedResourceIds.filter((id) => displayedResourcesIds.includes(id))
        .length === displayedResourcesIds.length
    );
  }, [selectedResourceIds, displayedResourcesIds]);

  const isCheckboxIndeterminate = useMemo(() => {
    return (
      displayedResourcesIds &&
      selectedResourceIds.filter((id) => displayedResourcesIds.includes(id))
        .length < displayedResourcesIds?.length &&
      selectedResourceIds.filter((id) => displayedResourcesIds.includes(id))
        .length > 0 &&
      selectedResourceIds.length > 0
    );
  }, [selectedResourceIds, displayedResourcesIds]);

  const handleCloseModal = () => {
    setSelectedResourceIds([]);
    handleClose(false);
  };

  const handleSearchResource = (
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
    if (selectedResourceIds.includes(id)) {
      setSelectedResourceIds(
        selectedResourceIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      setSelectedResourceIds([...selectedResourceIds, id]);
    }
  };

  const handleSelectAllClick = () => {
    if (selectedResourceIds.length === 0 && displayedResources) {
      setSelectedResourceIds(displayedResources.map((resource) => resource.id));
    } else if (areAllDisplayedResourcesSelected || isCheckboxIndeterminate) {
      const resourcesToKeep = selectedResourceIds.filter(
        (id) => !displayedResourcesIds?.includes(id)
      );
      setSelectedResourceIds(resourcesToKeep);
    } else if (displayedResourcesIds) {
      setSelectedResourceIds(selectedResourceIds.concat(displayedResourcesIds));
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
      handleClose(false);
      setSelectedResourceIds([]);
    }
  };
  useEffect(() => {
    setDisplayedResources(resources);
  }, [resources]);

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
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
          {displayedResources &&
            displayedResources.map((resource) => (
              <BatchResourceListItem
                resource={resource}
                handleClick={handleSelectResources}
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
          {`${t("runOn")} ${selectedResourceIds.length.toString()} ${t(
            "resources"
          ).toLowerCase()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchResourceDialog;
