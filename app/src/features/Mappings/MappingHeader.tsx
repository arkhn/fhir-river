import React, { useState } from "react";

import {
  Button,
  Divider,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import PlayIcon from "@material-ui/icons/PlayArrow";
import { useTranslation } from "react-i18next";

import MappingDeleteDialog from "features/Mappings/MappingDeleteDialog";
import MappingNameDialog from "features/Mappings/MappingNameDialog";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingInline: theme.spacing(5),
    boxShadow: `0px 5px 5px ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  navContainer: {
    display: "flex",
  },
  button: {
    textTransform: "none",
  },
  delete: {
    color: theme.palette.error.light,
  },
  actionButton: {
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    marginLeft: theme.spacing(1),
    paddingInline: theme.spacing(1),
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
  },
}));

const MappingHeader = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleEditSourceTableClick = () => {
    handleMenuClose();
  };
  const handleEditNameClick = () => {
    handleMenuClose();
    setNameDialogOpen(true);
  };
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  const handleNameDialogClose = () => {
    setNameDialogOpen(false);
  };
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.navContainer}>
        <NavigationBreadcrumbs />
        <IconButton
          onClick={handleMenuClick}
          className={classes.actionButton}
          size="small"
        >
          <MoreIcon />
        </IconButton>
      </div>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        startIcon={<PlayIcon />}
      >
        <Typography>{t("preview")}</Typography>
      </Button>
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
        <MenuItem>
          <ListItemText
            primary={t("editMappingName")}
            onClick={handleEditNameClick}
          />
        </MenuItem>
        <MenuItem>
          <ListItemText
            primary={t("editSourceTable")}
            onClick={handleEditSourceTableClick}
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemText
            primary={t("deleteMapping")}
            onClick={handleDeleteClick}
            className={classes.delete}
          />
        </MenuItem>
      </Menu>
      <MappingNameDialog
        open={isNameDialogOpen}
        onClose={handleNameDialogClose}
      />
      <MappingDeleteDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
      />
    </div>
  );
};

export default MappingHeader;
