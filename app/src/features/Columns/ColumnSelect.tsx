import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import usePrevious from "common/hooks/usePrevious";
import {
  useApiCredentialsListQuery,
  useApiOwnersListQuery,
  useApiResourcesRetrieveQuery,
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
  pendingColumn: Partial<Column>;
  onChange?: (column: Partial<Column>) => void;
};

const ColumnSelects = ({
  pendingColumn,
  onChange,
}: ColumnSelectsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();

  const { data: credentials } = useApiCredentialsListQuery({
    source: sourceId,
  });
  const { data: credentialOwners } = useApiOwnersListQuery(
    {
      credential: credentials?.[0]?.id,
    },
    {
      skip: !credentials?.[0],
    }
  );
  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  const { table: pendingColumnTable, column, owner: ownerId } = pendingColumn;
  const table = (pendingColumnTable || mapping?.primary_key_table) ?? undefined;
  const selectedOwner = ownerId
    ? credentialOwners?.find(({ id }) => id === ownerId)
    : credentialOwners?.find(({ id }) => id === mapping?.primary_key_owner);
  const schema = selectedOwner?.schema as Record<string, string[]>;
  const defaultValue = {
    id: "/",
    label: "/",
  };

  const ownerTable =
    table && selectedOwner
      ? {
          id: `${selectedOwner.id}/${table}`,
          label: `${selectedOwner.name}/${table}`,
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
              ...ownerTables.map((_table) => ({
                id: `${owner.id}/${_table}`,
                label: `${owner.name}/${_table}`,
              })),
            ];
          },
          [defaultValue]
        );
  };

  const tableOptions = getTableOptions(credentialOwners);

  const [columns, setColumns] = useState<string[]>(
    table && schema && table in schema ? schema[table] ?? [] : []
  );

  const isTableSelected = !!table;
  const isColumnSelected = !!column;

  const prevTable = usePrevious(table);
  const hasTableChanged = prevTable !== table;

  const handleOwnerTableChange = (
    _: React.ChangeEvent<Record<string, never>>,
    value: { id: string; label: string } | null
  ) => {
    if (value) {
      const [_owner, _table] = value.id.split("/");
      onChange &&
        onChange({
          ...pendingColumn,
          table: _table,
          owner: _owner,
          column: undefined,
        });
    }
  };
  const handleColumnChange = (
    event: React.ChangeEvent<Record<string, never>>,
    value: string
  ) => {
    onChange &&
      onChange({
        ...pendingColumn,
        column: value,
      });
  };

  useEffect(() => {
    if (schema && table) {
      const isColumnInTable =
        pendingColumn.column && schema[table]?.includes(pendingColumn.column);
      if (hasTableChanged && !isColumnInTable) {
        onChange &&
          onChange({
            ...pendingColumn,
            column: undefined,
          });
      }
      setColumns(schema[table] ?? []);
    }
  }, [schema, hasTableChanged, pendingColumn, table, onChange]);

  return (
    <>
      <Grid item>
        <Autocomplete
          className={classes.autocomplete}
          options={tableOptions}
          groupBy={(option) => option.label.split("/")[0] ?? ""}
          getOptionLabel={(option) => option.label.split("/")[1] ?? ""}
          getOptionSelected={({ id }) => id === selectedOwner?.id}
          value={ownerTable}
          onChange={handleOwnerTableChange}
          selectOnFocus
          openOnFocus
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
          className={classes.autocomplete}
          options={columns}
          value={column ?? ""}
          onChange={handleColumnChange}
          selectOnFocus
          openOnFocus
          clearOnBlur
          disableClearable
          handleHomeEndKeys
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
