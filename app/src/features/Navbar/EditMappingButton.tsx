import React, { useState } from "react";

import {
  makeStyles,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import MappingDeleteDialog from "features/Mappings/Delete/MappingDeleteDialog";
import MappingNameDialog from "features/Mappings/Edit/MappingNameDialog";

const useStyles = makeStyles((theme) => ({
  delete: {
    color: theme.palette.error.light,
  },
  actionButton: {
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    marginRight: theme.spacing(1),
    paddingInline: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 5,
    height: 40,
  },
}));

const EditMappingButton = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleNameDialogClose = () => {
    setNameDialogOpen(false);
  };
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEditSourceTableClick = () => {
    handleMenuClose();
    history.push(`/sources/${sourceId}/mappings/${mappingId}/edit`);
  };
  const handleEditNameClick = () => {
    handleMenuClose();
    setNameDialogOpen(true);
  };
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <IconButton onClick={handleMenuClick} className={classes.actionButton}>
        <MoreIcon />
      </IconButton>
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
    </>
  );
};

export default EditMappingButton;
