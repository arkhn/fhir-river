import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useApiValueSetsRetrieveQuery } from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  autocomplete: {
    maxWidth: 534,
    color: theme.palette.text.disabled,
  },
  selected: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  autocompleteIcon: {
    paddingLeft: theme.spacing(1),
  },
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.text.disabled,
  },
  iconSelected: {
    fill: theme.palette.orange.main,
  },
}));

type FhirResourceAutocompleteProps = {
  value: string;
  onChange: (code: string) => void;
};

const FhirResourceAutocomplete = ({
  value,
  onChange,
}: FhirResourceAutocompleteProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { data } = useApiValueSetsRetrieveQuery({
    id: "resource-types",
  });

  const resourceTypesCodes = data?.expansion?.contains
    ?.map(({ code }) => code || "")
    .sort();

  const handleValueChange = (
    event: React.ChangeEvent<Record<string, never>>,
    newValue: string
  ) => {
    onChange && onChange(newValue);
  };

  return (
    <Autocomplete
      className={classes.autocomplete}
      options={resourceTypesCodes ?? []}
      value={value}
      onChange={handleValueChange}
      selectOnFocus
      openOnFocus
      clearOnBlur
      fullWidth
      disableClearable
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          placeholder={t("selectFhirResource")}
          InputProps={{
            ...params.InputProps,
            className: clsx(params.InputProps.className, {
              [classes.selected]: value !== "",
            }),
            startAdornment: (
              <Icon
                icon={IconNames.FLAME}
                iconSize={15}
                className={clsx(classes.icon, classes.autocompleteIcon, {
                  [classes.iconSelected]: value !== "",
                })}
              />
            ),
          }}
        />
      )}
    />
  );
};

export default FhirResourceAutocomplete;
