import React, { useState } from "react";
import { Source } from "services/api/generated/api.generated";
import { useTranslation } from "react-i18next";
import {
  useDestroySourceMutation,
  useListSourceAttributes,
  useListSourceResources,
} from "services/api/api";
import clsx from "clsx";

import CardContentItem from "common/CardContentItem/CardContentItem";
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

import { ReactComponent as Mapping } from "assets/icons/mapping_icon.svg";
import More from "@material-ui/icons/MoreHoriz";
import ManagePermissions from "@material-ui/icons/Person";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import Attribute from "@material-ui/icons/LocalOffer";

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
  mappingCount?: number;
  attributesCount?: number;
  onClick?: (id?: string) => void;
  editSource?: (source: Source) => void;
};

const SourceCard = ({
  source,
  onClick,
  editSource,
}: SourceCardProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [deleteSource] = useDestroySourceMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useListSourceResources(source);
  const {
    data: attributes,
    isLoading: isAttributesLoading,
  } = useListSourceAttributes(source);

  const attributesCount = attributes?.length;
  const mappingCount = mappings?.length;

  const isSourceInfosLoading = isMappingLoading || isAttributesLoading;

  const handleClick = () => {
    onClick && onClick(source.id);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleManagePermissions = () => {
    handleClose();
  };
  const handleRename = () => {
    editSource && editSource(source);
    handleClose();
  };
  const handleDelete = () => {
    source.id && deleteSource({ id: source.id });
  };

  return (
    <Card className={classes.root} variant="outlined" onClick={handleClick}>
      <CardHeader
        title={source.name}
        titleTypographyProps={{ variant: "h6" }}
        action={
          <>
            <IconButton
              onClick={handleMenuClick}
              className={classes.actionButton}
              size="small"
              data-testid="more-button"
            >
              <More />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
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
                  <ManagePermissions />
                </ListItemIcon>
                <ListItemText primary={t("managePermissions")} />
              </MenuItem>
              <MenuItem onClick={handleRename}>
                <ListItemIcon className={classes.listItemIcon}>
                  <Edit />
                </ListItemIcon>
                <ListItemText primary={t("rename")} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete}>
                <ListItemIcon
                  className={clsx(classes.listItemIcon, classes.delete)}
                >
                  <Delete />
                </ListItemIcon>
                <ListItemText
                  primary={t("delete")}
                  className={classes.delete}
                />
              </MenuItem>
            </Menu>
          </>
        }
      />
      <CardContent>
        {isSourceInfosLoading ? (
          <CircularProgress />
        ) : (
          <>
            {undefined !== mappingCount && (
              <CardContentItem
                label={t("mappingCount", { count: mappingCount })}
                startAdornment={<Mapping className={classes.icon} />}
              />
            )}
            {undefined !== attributesCount && (
              <CardContentItem
                label={t("attributesCount", { count: attributesCount })}
                startAdornment={<Attribute className={classes.icon} />}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceCard;
