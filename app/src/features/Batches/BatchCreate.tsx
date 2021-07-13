import React, { useState } from "react";

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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayIcon from "@material-ui/icons/PlayCircleOutline";
//import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Alert from "common/components/Alert";
import Button from "common/components/Button";
import {
  useApiResourcesListQuery,
  useApiBatchesCreateMutation,
} from "services/api/endpoints";
import {
  useApiSourcesExportRetrieveQuery,
  Mapping,
} from "services/api/generated/api.generated";

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
    margin: theme.spacing(1),
    marginTop: "auto",
    marginBottom: "auto",
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
    fontWeight: theme.typography.fontWeightBold,
  },
  label: {
    transform: "translate(14px, 12px) scale(1)",
  },
  dialog: {
    padding: theme.spacing(3),
    maxHeight: 515,
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
  },
  titleButton: {
    marginTop: "auto",
    marginBottom: "auto",
  },
}));

const BatchCreate = (): JSX.Element => {
  //const { t } = useTranslation();

  const classes = useStyles();

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const handleAlertClose = () => setAlert(undefined);

  const { sourceId: id } = useParams<{ sourceId: string }>();

  const {
    data: mappings,
    refetch: refetchMappings,
  } = useApiSourcesExportRetrieveQuery({ id });

  const { data: resources } = useApiResourcesListQuery(
    { source: id },
    { skip: !Boolean(id) }
  );

  const [apiBatchCreate] = useApiBatchesCreateMutation();

  const handleBatchRun = async () => {
    refetchMappings();

    if (mappings) {
      const filteredMappings: Mapping = {
        ...mappings,
        resources: mappings.resources?.filter(({ id }) =>
          selectedResourceIds.includes(id)
        ),
      };
      try {
        await apiBatchCreate({
          batchRequest: {
            mappings: filteredMappings,
          },
        }).unwrap();

        setSelectedResourceIds([]);
      } catch (e) {
        setAlert(e.message as string);
      }
    }
  };

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => setOpen(true)}
        className={classes.button}
        startIcon={<PlayIcon />}
      >
        <Typography>Run new batch</Typography>
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{ paper: classes.dialog }}
        fullWidth
      >
        <div className={classes.title}>
          <DialogTitle>Choose a resource</DialogTitle>
          <Button
            size="large"
            className={classes.titleButton}
            variant="outlined"
            onClick={() => {
              if (resources)
                setSelectedResourceIds(
                  selectedResourceIds.length === resources.length
                    ? []
                    : resources?.map((resource) => resource.id)
                );
            }}
          >
            <Typography>
              {resources && selectedResourceIds.length === resources.length
                ? "unselect all"
                : "select all"}
            </Typography>
          </Button>
        </div>
        <DialogContent dividers>
          <List>
            {resources &&
              resources.map(({ id, definition_id, label }) => (
                <ListItem
                  role={undefined}
                  key={`resource-option-${id}`}
                  button
                  onClick={() => {
                    if (
                      !selectedResourceIds.find(
                        (resourceId) => resourceId === id
                      )
                    ) {
                      setSelectedResourceIds([...selectedResourceIds, id]);
                    } else {
                      const index = selectedResourceIds.indexOf(id);
                      const newSelectedResourceIds = [...selectedResourceIds];
                      newSelectedResourceIds.splice(index, 1);
                      setSelectedResourceIds(newSelectedResourceIds);
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      color="primary"
                      checked={selectedResourceIds.includes(id)}
                    />
                  </ListItemIcon>
                  <ListItemText primary={`${definition_id} - ${label}`} />
                </ListItem>
              ))}
            <ListItem role={undefined} button>
              <ListItemIcon>
                <Checkbox
                  color="primary"
                  checked={selectedResourceIds.includes(id)}
                />
              </ListItemIcon>
              <ListItemText primary={"new"} />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={() => {
              handleBatchRun();
              setOpen(false);
            }}
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
