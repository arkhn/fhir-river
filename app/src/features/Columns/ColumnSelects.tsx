import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles } from "@material-ui/core";
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
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.text.disabled,
  },
  iconSelected: {
    fill: theme.palette.secondary.main,
  },
}));

type ColumnSelectsProps = {
  column?: Partial<Column>;
  onChange?: (column: Partial<Column>) => void;
};

const ColumnSelects = ({
  column,
  onChange,
}: ColumnSelectsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { sourceId } = useParams<{ sourceId?: string }>();
  const { data: credential } = useApiCredentialsListQuery({ source: sourceId });
  const { data: credentialOwners } = useApiOwnersListQuery({
    credential: credential?.[0].id,
  });
  const selectedOwner = credentialOwners?.[0];
  const schema = selectedOwner?.schema as Record<string, string[]>;

  const tables = (schema && Object.keys(schema)) || [];
  const [columns, setColumns] = useState<string[]>([]);

  const isTableSelected = !!column?.table;
  const isColumnSelected = !!column?.column;

  const prevTable = usePrevious(column?.table);
  const hasTableChanged = prevTable !== column?.table;

  const handleTableChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onChange &&
      onChange({
        ...column,
        table: event.target.value as string,
      });
  };
  const handleColumnChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onChange &&
      onChange({
        ...column,
        column: event.target.value as string,
      });
  };

  useEffect(() => {
    if (schema && hasTableChanged && column?.table) {
      // Reset column only if it is not in the new table pendingColumn list
      if (column.column && !schema[column.table].includes(column.column)) {
        onChange &&
          onChange({
            ...column,
            column: undefined,
          });
      }
      setColumns(schema[column.table]);
    }
  }, [schema, hasTableChanged, column]);

  return (
    <>
      <Grid item>
        <Select
          value={column?.table ?? ""}
          options={tables}
          emptyOption={t("selectTable")}
          onChange={handleTableChange}
          startIcon={
            <Icon
              icon={IconNames.TH}
              iconSize={15}
              className={clsx(classes.icon, {
                [classes.iconSelected]: isTableSelected,
              })}
            />
          }
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
