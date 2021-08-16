import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Divider,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Container,
} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";

import Button from "common/components/Button";
import MappingDeleteDialog from "features/Mappings/Delete/MappingDeleteDialog";
import MappingNameDialog from "features/Mappings/Edit/MappingNameDialog";
import NavigationBreadcrumbs from "features/NavigationBreadcrumbs/NavigationBreadcrumbs";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: `0px 5px 5px ${theme.palette.divider}`,
    justifyContent: "space-between",
  },
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
  previewButton: {
    justifySelf: "flex-end",
    marginLeft: "auto",
  },
}));

const MappingHeader = (): JSX.Element => {
  const history = useHistory();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
  const handleNameDialogClose = () => {
    setNameDialogOpen(false);
  };
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  const handlePreviewClick = () => {
    history.push(`${location.pathname}/preview`);
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="xl">
        <NavigationBreadcrumbs
          editMappingButton={
            <IconButton
              onClick={handleMenuClick}
              className={classes.actionButton}
            >
              <MoreIcon />
            </IconButton>
          }
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon icon={IconNames.PLAY} />}
            onClick={handlePreviewClick}
            className={classes.previewButton}
          >
            <Typography>{t("preview")}</Typography>
          </Button>
        </NavigationBreadcrumbs>
      </Container>
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
