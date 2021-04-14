import React from "react";

import {
  OutlinedInput,
  MenuItem,
  SelectProps as MuiSelectProps,
  Select as MuiSelect,
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";

type SelectProps = {
  startIcon?: React.ReactNode;
  options?: string[];
  emptyOption?: string;
} & MuiSelectProps;

const useStyles = makeStyles((theme) => ({
  selectInput: {
    minWidth: 200,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.disabled,
  },
  selected: {
    color: theme.palette.text.primary,
  },
}));

const Select = ({
  startIcon,
  options,
  emptyOption,
  value,
  className,
  ...muiSelectProps
}: SelectProps): JSX.Element => {
  const classes = useStyles();
  return (
    <MuiSelect
      className={clsx(classes.selectInput, className)}
      displayEmpty
      input={
        <OutlinedInput
          margin="dense"
          startAdornment={startIcon}
          inputProps={{
            className: clsx({
              [classes.selected]: value !== emptyOption && value !== "",
            }),
          }}
        />
      }
      value={value}
      {...muiSelectProps}
    >
      {emptyOption && (
        <MenuItem disabled value="">
          {emptyOption}
        </MenuItem>
      )}
      {options &&
        options.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
    </MuiSelect>
  );
};

export default Select;
