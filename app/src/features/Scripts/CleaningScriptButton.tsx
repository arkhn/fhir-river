import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Button,
  makeStyles,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import {
  Scripts,
  useApiScriptsListQuery,
} from "services/api/generated/api.generated";

import ScriptListItem from "./ScriptListItem";

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.text.primary,
  },
  iconSelected: {
    fill: theme.palette.primary.main,
  },
  button: {
    textTransform: "none",
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
    },
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  menuPopup: {
    maxHeight: 300,
  },
}));

type CleaningScriptButtonType = {
  scriptName?: string;
  onChange: (script: Scripts) => void;
};

const CleaningScriptButton = ({
  scriptName,
  onChange,
}: CleaningScriptButtonType): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isInputScriptSelected = scriptName !== undefined && scriptName !== "";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: scripts, isLoading: isScriptsLoading } = useApiScriptsListQuery(
    {}
  );

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScriptChange = (script: Scripts) => () => {
    handleMenuClose();
    if (scriptName !== script.name) {
      onChange && onChange(script);
    }
  };

  return (
    <>
      <Button
        size="small"
        className={classes.button}
        onClick={handleMenuToggle}
        color={isInputScriptSelected ? "primary" : "default"}
        startIcon={
          <Icon
            icon={IconNames.FUNCTION}
            className={clsx(classes.icon, {
              [classes.iconSelected]: isInputScriptSelected,
            })}
          />
        }
      >
        <Typography>
          {isInputScriptSelected ? scriptName : t("applyScript")}
        </Typography>
      </Button>
      <Menu
        id="script-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{
          className: classes.menuPopup,
        }}
      >
        {isScriptsLoading ? (
          <CircularProgress />
        ) : (
          scripts &&
          scripts.map((script, index) => (
            <MenuItem
              key={`${script.name}-${index}`}
              onClick={handleScriptChange(script)}
              selected={scriptName === script.name}
            >
              <ScriptListItem script={script} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default CleaningScriptButton;