import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Select from "common/components/Select";
import usePrevious from "common/hooks/usePrevious";
import {
  useApiCredentialsListQuery,
  useApiOwnersListQuery,
} from "services/api/endpoints";
import { Column } from "services/api/generated/api.generated";

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
    fill: theme.palette.secondary.main,
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
  const { sourceId } = useParams<{ sourceId?: string }>();
  const { data: credential } = useApiCredentialsListQuery({ source: sourceId });
  const { data: credentialOwners } = useApiOwnersListQuery({
    credential: credential?.[0].id,
  });
  const { table, column, owner: ownerId } = pendingColumn;
  const selectedOwner = credentialOwners?.find(({ id }) => id === ownerId);
  const schema = selectedOwner?.schema as Record<string, string[]>;
  const ownerTable =
    table && selectedOwner
      ? {
          id: `${selectedOwner.id}/${table}`,
          label: `${selectedOwner.name}/${table}`,
        }
      : undefined;

  const tables = !credentialOwners
    ? []
    : credentialOwners.reduce((acc: { id: string; label: string }[], owner) => {
        const ownerTables = Object.keys(owner.schema);
        return [
          ...acc,
          ...ownerTables.map((_table) => ({
            id: `${owner.id}/${_table}`,
            label: `${owner.name}/${_table}`,
          })),
        ];
      }, []);
  const [columns, setColumns] = useState<string[]>([]);

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
        });
    }
  };
  const handleColumnChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onChange &&
      onChange({
        ...pendingColumn,
        column: event.target.value as string,
      });
  };

  useEffect(() => {
    const { table, column } = pendingColumn;
    if (schema && hasTableChanged && table) {
      // Reset column only if it is not in the new table pendingColumn list
      if (column && !schema[table].includes(column)) {
        onChange &&
          onChange({
            ...pendingColumn,
            column: undefined,
          });
      }
      setColumns(schema[table]);
    }
  }, [schema, hasTableChanged, pendingColumn]);

  return (
    <>
      <Grid item>
        <Autocomplete
          className={classes.autocomplete}
          options={tables}
          groupBy={(option) => option.label.split("/")[0]}
          getOptionLabel={(option) => option.label.split("/")[1]}
          onChange={handleOwnerTableChange}
          value={ownerTable}
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
                  [classes.selected]: undefined !== ownerTable,
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
        <Select
          value={column ?? ""}
          options={columns}
          emptyOption={t("selectColumn")}
          onChange={handleColumnChange}
          startIcon={
            <Icon
              icon={IconNames.COLUMN_LAYOUT}
              iconSize={15}
              className={clsx(classes.icon, {
                [classes.iconSelected]: isColumnSelected,
              })}
            />
          }
        />
      </Grid>
    </>
  );
};

export default ColumnSelects;
