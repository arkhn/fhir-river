import React, { useState } from "react";

import {
  Button,
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

import MappingInfo from "features/mappings/MappingInfo";
import { useApiResourcesListQuery } from "services/api/endpoints";
import { Resource, Source } from "services/api/generated/api.generated";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type MappingSelectButtonProps = {
  source: Source;
  mapping: Resource;
  onChange?: (mapping: Resource) => void;
};

const MappingSelectButton = ({
  source,
  mapping,
  onChange,
}: MappingSelectButtonProps): JSX.Element => {
  const classes = useStyles();
  const [isPopperOpen, setPopperOpen] = useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const {
    data: mappings,
    isLoading: isMappingsLoading,
  } = useApiResourcesListQuery({ source: source.id });

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
  const handleMappingChange = (mapping: Resource) => () => {
    handlePopperClose();
    onChange && onChange(mapping);
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
                        onClick={handleMappingChange(_mapping)}
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
