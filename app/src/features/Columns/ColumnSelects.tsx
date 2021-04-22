import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Select from "common/Select/Select";
import { Owner } from "services/api/generated/api.generated";

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
  owner?: Owner;
  PKTable?: string;
  PKColumn?: string;

  onPKTableChange?: (PKTable?: string) => void;
  onPKColumnChange?: (PKColumn?: string) => void;
};

const ColumnSelects = ({
  owner,
  PKTable,
  PKColumn,
  onPKTableChange,
  onPKColumnChange,
}: ColumnSelectsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const PKTables = Object.keys(owner?.schema ?? []);
  const [PKColumns, setPKColumns] = useState<string[]>([]);

  const isPKTableSelected = !!PKTable;
  const isPKColumnSelected = !!PKColumn;

  const handlePKTableChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onPKTableChange && onPKTableChange(event.target.value as string);
  };
  const handlePKColumnChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onPKColumnChange && onPKColumnChange(event.target.value as string);
  };

  useEffect(() => {
    if (owner && owner.schema) {
      const schema = owner.schema as Record<string, string[]>;
      if (PKTable) {
        onPKColumnChange && onPKColumnChange();
        setPKColumns(schema[PKTable]);
      }
    }
  }, [owner, PKTable]);

  return (
    <>
      <Grid item>
        <Select
          value={PKTable ?? ""}
          options={PKTables}
          emptyOption={t("selectTable")}
          onChange={handlePKTableChange}
          startIcon={
            <Icon
              icon={IconNames.TH}
              iconSize={15}
              className={clsx(classes.icon, {
                [classes.iconSelected]: isPKTableSelected,
              })}
            />
          }
        />
      </Grid>
      <Grid item>
        <Select
          value={PKColumn ?? ""}
          options={PKColumns}
          emptyOption={t("selectColumn")}
          onChange={handlePKColumnChange}
          startIcon={
            <Icon
              icon={IconNames.COLUMN_LAYOUT}
              iconSize={15}
              className={clsx(classes.icon, {
                [classes.iconSelected]: isPKColumnSelected,
              })}
            />
          }
        />
      </Grid>
    </>
  );
};

export default ColumnSelects;
