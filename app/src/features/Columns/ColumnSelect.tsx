import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import AutocompletePopper from "common/components/AutocompletePopper";
import usePrevious from "common/hooks/usePrevious";
import {
  useApiCredentialsListQuery,
  useApiOwnersListQuery,
} from "services/api/endpoints";
import type { Column, Owner } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  autocomplete: {
    minWidth: 200,
    color: theme.palette.text.disabled,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
  autocompleteIcon: {
    paddingLeft: theme.spacing(1),
  },
  selected: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.text.disabled,
  },
  iconSelected: {
    fill: theme.palette.icons.table.main,
  },
}));

type ColumnSelectsProps = {
  column: Partial<Column>;
  onChange?: (column: Partial<Column>) => void;
};

const ColumnSelects = ({
  column,
  onChange,
}: ColumnSelectsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();

  const { data: credentials } = useApiCredentialsListQuery({
    project: projectId,
  });
  const { data: credentialOwners } = useApiOwnersListQuery(
    {
      credential: credentials?.[0]?.id,
    },
    {
      skip: !credentials?.[0],
    }
  );

  const selectedOwner = credentialOwners?.find(({ id }) => id === column.owner);
  const schema = selectedOwner?.schema as Record<string, string[]>;
  const defaultValue = {
    id: "/",
    label: "/",
  };
  const ownerTable =
    column.table && selectedOwner
      ? {
          id: `${selectedOwner.id}/${column.table}`,
          label: `${selectedOwner.name}/${column.table}`,
        }
      : defaultValue;

  const getTableOptions = (
    owners?: Owner[]
  ): { id: string; label: string }[] => {
    return !owners
      ? []
      : owners.reduce(
          (acc: { id: string; label: string }[], owner) => {
            const ownerTables = Object.keys(owner.schema);
            return [
              ...acc,
              ...ownerTables.map((table) => ({
                id: `${owner.id}/${table}`,
                label: `${owner.name}/${table}`,
              })),
            ];
          },
          [defaultValue]
        );
  };

  const tableOptions = getTableOptions(credentialOwners);
  const [columns, setColumns] = useState<string[]>(
    column.table && schema && column.table in schema
      ? schema[column.table] ?? []
      : []
  );

  const isTableSelected = !!column.table;
  const isColumnSelected = !!column.column;

  const prevTable = usePrevious(column.table);
  const hasTableChanged = prevTable !== column.table;

  const handleOwnerTableChange = (
    _: React.ChangeEvent<Record<string, never>>,
    value: { id: string; label: string } | null
  ) => {
    if (value) {
      const [owner, table] = value.id.split("/");
      onChange &&
        onChange({
          ...column,
          table,
          owner,
          column: "",
        });
    }
  };
  const handleColumnChange = (
    event: React.ChangeEvent<Record<string, never>>,
    value: string
  ) => {
    onChange &&
      onChange({
        ...column,
        column: value,
      });
  };

  useEffect(() => {
    if (schema && column.table) {
      const isColumnInTable =
        column.column && schema[column.table]?.includes(column.column);
      if (hasTableChanged && !isColumnInTable) {
        onChange &&
          onChange({
            ...column,
            column: undefined,
          });
      }
      setColumns(schema[column.table] ?? []);
    }
  }, [schema, hasTableChanged, column, column.table, onChange]);

  return (
    <>
      <Grid item>
        <Autocomplete
          PopperComponent={AutocompletePopper}
          className={classes.autocomplete}
          options={tableOptions}
          groupBy={(option) => option.label.split("/")[0] ?? ""}
          getOptionLabel={(option) => option.label.split("/")[1] ?? ""}
          getOptionSelected={({ id }) => id === ownerTable?.id}
          value={ownerTable}
          onChange={handleOwnerTableChange}
          selectOnFocus
          openOnFocus
          data-testid="table_input"
          clearOnBlur
          disableClearable
          handleHomeEndKeys
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              size="small"
              placeholder={t("selectTable")}
              InputProps={{
                ...params.InputProps,
                className: clsx(params.InputProps.className, {
                  [classes.selected]: ownerTable !== undefined,
                }),
                startAdornment: (
                  <Icon
                    icon={IconNames.TH}
                    iconSize={15}
                    className={clsx(classes.icon, classes.autocompleteIcon, {
                      [classes.iconSelected]: isTableSelected,
                    })}
                  />
                ),
              }}
            />
          )}
        />
      </Grid>
      <Grid item>
        <Autocomplete
          PopperComponent={AutocompletePopper}
          className={classes.autocomplete}
          options={columns}
          value={column.column ?? ""}
          onChange={handleColumnChange}
          selectOnFocus
          openOnFocus
          clearOnBlur
          disableClearable
          handleHomeEndKeys
          data-testid="column_input"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              size="small"
              placeholder={t("selectColumn")}
              InputProps={{
                ...params.InputProps,
                className: clsx(params.InputProps.className, {
                  [classes.selected]: column !== undefined,
                }),
                startAdornment: (
                  <Icon
                    icon={IconNames.COLUMN_LAYOUT}
                    iconSize={15}
                    className={clsx(classes.icon, classes.autocompleteIcon, {
                      [classes.iconSelected]: isColumnSelected,
                    })}
                  />
                ),
              }}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default ColumnSelects;
