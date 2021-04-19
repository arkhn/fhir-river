import React, { useState } from "react";

import {
  Card,
  CardHeader,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import ManagePermissionsIcon from "@material-ui/icons/Person";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import { useAppDispatch } from "app/store";
import { useApiSourcesDestroyMutation } from "services/api/endpoints";
import { Source } from "services/api/generated/api.generated";

import SourceCardInfo from "./SourceCardInfo";
import { editSource } from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 300,
    textAlign: "left",
    cursor: "pointer",
  },
  listItemIcon: {
    minWidth: 33,
    color: theme.palette.text.primary,
  },
  delete: {
    color: theme.palette.error.light,
  },
  actionButton: {
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
  },
}));

type SourceCardProps = {
  source: Source;
};

const SourceCard = ({ source }: SourceCardProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [deleteSource] = useApiSourcesDestroyMutation();

  const handleCardClick = () => {
    history.push(`/source/${source.id}`);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditSource = () => {
    dispatch(editSource(source));
    handleMenuClose();
  };
  const handleDeleteSource = () => deleteSource({ id: source.id });

  return (
    <>
      <Card
        className={classes.root}
        variant="outlined"
        onClick={handleCardClick}
      >
        <CardHeader
          title={source.name}
          titleTypographyProps={{ variant: "h6" }}
          action={
            <>
              <IconButton
                onClick={handleMenuClick}
                className={classes.actionButton}
                size="small"
                aria-label={`${source.name} menu`}
              >
                <MoreIcon />
              </IconButton>
            </>
          }
        />
        <SourceCardInfo source={source} />
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
        variant="menu"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem disabled>
          <ListItemIcon className={classes.listItemIcon}>
            <ManagePermissionsIcon />
          </ListItemIcon>
          <ListItemText primary={t("managePermissions")} />
        </MenuItem>
        <MenuItem onClick={handleEditSource}>
          <ListItemIcon className={classes.listItemIcon}>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={t("edit")} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteSource}>
          <ListItemIcon className={clsx(classes.listItemIcon, classes.delete)}>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t("delete")} className={classes.delete} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default SourceCard;
