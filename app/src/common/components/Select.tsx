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
  options?: (string | { id: string; label?: string })[];
  emptyOption?: string;
} & MuiSelectProps;

const useStyles = makeStyles((theme) => ({
  selectInput: {
    minWidth: 200,
    color: theme.palette.text.disabled,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
  selected: {
    fontWeight: 500,
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
        options.map((option) =>
          typeof option === "string" ? (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ) : (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          )
        )}
    </MuiSelect>
  );
};

export default Select;
