import React, { useState } from "react";
import { Source } from "services/api/generated/api.generated";
import { useTranslation } from "react-i18next";
import { useDestroySourceMutation } from "services/api/api";
import clsx from "clsx";

import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
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
  sourceDetail: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
  mappingCount,
  attributesCount,
  onClick,
  editSource,
}: SourceCardProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [deleteSource] = useDestroySourceMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const _handleClick = () => {
    onClick && onClick(source.id);
  };
  const _handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const _handleClose = () => {
    setAnchorEl(null);
  };
  const _managePermissions = () => {
    _handleClose();
  };
  const _rename = () => {
    editSource && editSource(source);
    _handleClose();
  };
  const _delete = () => {
    source.id && deleteSource({ id: source.id });
  };

  return (
    <Card className={classes.root} variant="outlined" onClick={_handleClick}>
      <CardHeader
        title={source.name}
        titleTypographyProps={{ variant: "h6" }}
        action={
          <>
            <IconButton
              onClick={_handleMenuClick}
              className={classes.actionButton}
              size="small"
            >
              <More />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={_handleClose}
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
              <MenuItem onClick={_managePermissions} disabled>
                <ListItemIcon className={classes.listItemIcon}>
                  <ManagePermissions />
                </ListItemIcon>
                <ListItemText primary={t("managePermissions")} />
              </MenuItem>
              <MenuItem onClick={_rename}>
                <ListItemIcon className={classes.listItemIcon}>
                  <Edit />
                </ListItemIcon>
                <ListItemText primary={t("rename")} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={_delete}>
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
        {mappingCount !== undefined && (
          <div className={classes.sourceDetail}>
            <Mapping className={classes.icon} />
            <Typography color="textSecondary">
              {t("mappingCount", { count: mappingCount })}
            </Typography>
          </div>
        )}
        {attributesCount !== undefined && (
          <div className={classes.sourceDetail}>
            <Attribute className={classes.icon} />
            <Typography color="textSecondary">
              {t("attributesCount", { count: attributesCount })}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceCard;
