import React, { useState } from "react";

import {
  CircularProgress,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  makeStyles,
} from "@material-ui/core";
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp";
import { useHistory } from "react-router-dom";

import Button from "common/components/Button";
import MappingInfo from "features/Mappings/MappingInfo";
import { useApiResourcesListQuery } from "services/api/endpoints";
import { Resource, Project } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  button: {
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
    border: `1px solid ${theme.palette.divider}`,
    marginRight: theme.spacing(1),
  },
}));

type MappingSelectButtonProps = {
  project: Project;
  mapping: Resource;
};

const MappingSelectButton = ({
  project,
  mapping,
}: MappingSelectButtonProps): JSX.Element => {
  const classes = useStyles();
  const history = useHistory();
  const [isPopperOpen, setPopperOpen] = useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const {
    data: mappings,
    isLoading: isMappingsLoading,
  } = useApiResourcesListQuery({ project: project.id });

  const handlePopperToggle = () => {
    setPopperOpen(!isPopperOpen);
  };
  const handlePopperClose = (
    event?: React.MouseEvent<Document, MouseEvent>
  ) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event?.target as HTMLElement)
    ) {
      return;
    }
    setPopperOpen(false);
  };
  const handleMappingClick = (selectedMapping: Resource) => () => {
    handlePopperClose();
    history.push(`/projects/${project.id}/mappings/${selectedMapping.id}`);
  };

  return (
    <>
      <Button
        className={classes.button}
        onClick={handlePopperToggle}
        ref={anchorRef}
        variant="outlined"
        size="small"
        endIcon={isPopperOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
      >
        <MappingInfo mapping={mapping} />
      </Button>
      <Popper
        open={isPopperOpen}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handlePopperClose}>
                <MenuList>
                  {isMappingsLoading ? (
                    <CircularProgress />
                  ) : (
                    mappings &&
                    mappings.map((_mapping) => (
                      <MenuItem
                        key={_mapping.id}
                        selected={mapping.id === _mapping.id}
                        onClick={handleMappingClick(_mapping)}
                      >
                        <MappingInfo mapping={_mapping} />
                      </MenuItem>
                    ))
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default MappingSelectButton;
