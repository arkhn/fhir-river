import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
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
import AttributeIcon from "@material-ui/icons/LocalOffer";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import ManagePermissionsIcon from "@material-ui/icons/Person";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

import CardContentItem from "common/CardContentItem/CardContentItem";
import {
  useDestroySourceMutation,
  useListSourceAttributes,
  useListSourceResources,
} from "services/api/api";
import { Source } from "services/api/generated/api.generated";

import { useAppDispatch } from "../../app/store";
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
  icon: {
    width: 12,
    height: 12,
    marginRight: theme.spacing(1),
    "& path": {
      fill: theme.palette.text.secondary,
    },
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

  const [deleteSource] = useDestroySourceMutation();

  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useListSourceResources(source);
  const {
    data: attributes,
    isLoading: isAttributesLoading,
  } = useListSourceAttributes(source);

  const attributesCount = attributes?.length;
  const mappingsCount = mappings?.length;
  const isSourceInfosLoading = isMappingLoading || isAttributesLoading;

  const handleCardClick = () => {
    history.push(`/source/${source.id}`);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleManagePermissions = () => handleClose();
  const handleRenameSource = () => {
    dispatch(editSource(source));
    handleClose();
  };
  const handleDeleteSource = () => {
    source.id && deleteSource({ id: source.id });
  };

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
            <IconButton
              onClick={handleMenuClick}
              className={classes.actionButton}
              size="small"
              aria-label={`${source.name} menu`}
            >
              <MoreIcon />
            </IconButton>
          }
        />
        <CardContent>
          {isSourceInfosLoading ? (
            <CircularProgress />
          ) : (
            <>
              {mappingsCount !== undefined && (
                <CardContentItem
                  label={t("mappingCount", { count: mappingsCount })}
                  startAdornment={
                    <Icon
                      icon={IconNames.DIAGRAM_TREE}
                      className={classes.icon}
                      iconSize={12}
                    />
                  }
                />
              )}
              {attributesCount !== undefined && (
                <CardContentItem
                  label={t("attributesCount", { count: attributesCount })}
                  startAdornment={<AttributeIcon className={classes.icon} />}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Menu
        anchorEl={anchorEl}
        autoFocus
        open={Boolean(anchorEl)}
        onClose={handleClose}
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
        <MenuItem onClick={handleManagePermissions} disabled>
          <ListItemIcon className={classes.listItemIcon}>
            <ManagePermissionsIcon />
          </ListItemIcon>
          <ListItemText primary={t("managePermissions")} />
        </MenuItem>
        <MenuItem onClick={handleRenameSource}>
          <ListItemIcon className={classes.listItemIcon}>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={t("rename")} />
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
