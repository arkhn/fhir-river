import React, { useEffect, useState } from "react";

import {
  Checkbox,
  Dialog,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PlayCircleOutline, Search } from "@material-ui/icons";
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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "50%",
  },
  button: {
    textTransform: "none",
    margin: theme.spacing(3, 1, 1, 1),
  },
  menuItem: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  menuPaper: {
    maxHeight: ITEM_HEIGHT * 4.5 + theme.spacing(1),
    width: 250,
  },
  select: {
    padding: theme.spacing(1.3),
  },
  selectAll: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  label: {
    transform: "translate(14px, 12px) scale(1)",
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
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const handleAlertClose = () => setAlert(undefined);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );

  const [resourceList, setResourceList] = useState(resources);

  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleBatchRun = () => {
    setOpen(false);
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
        <Typography>{t("runNewBatch")}</Typography>
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
              {t("chooseSource")}
            </DialogTitle>
            <div
              onClick={handleSelectAllResources}
              className={classes.selectAll}
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
            placeholder={t<string>("search...")}
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
