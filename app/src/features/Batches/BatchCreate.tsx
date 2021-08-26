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
  const [resourceList, setResourceList] = useState(resources);
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
                {resources && selectedResourceIds.length === resources.length
                  ? t("unselectAll")
                  : t("selectAll")}
              </Typography>
              <Checkbox
                color="primary"
                checked={
                  resources && selectedResourceIds.length === resources.length
                }
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
            {resourceList &&
              resourceList.length > 0 &&
              resourceList.map(({ id, definition_id, label }) => (
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
            <Typography>Run</Typography>
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
