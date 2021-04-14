import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  Grid,
  makeStyles,
  Button,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Select from "common/Select/Select";
import {
  Resource,
  useListOwnersQuery,
} from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  icon: {
    paddingRight: theme.spacing(1),
    fill: theme.palette.text.disabled,
  },
  iconSelected: {
    fill: theme.palette.secondary.main,
  },
  inputSelected: {
    fontWeight: 500,
  },
}));

type TableStepProps = {
  mapping: Partial<Resource>;
  onChange?: (mapping: Partial<Resource>) => void;
};

const TableStep = ({ onChange, mapping }: TableStepProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: owners } = useListOwnersQuery({});
  const owner = owners?.[0];
  const PKTables = Object.keys(owner?.schema ?? []);
  const [PKColumns, setPKColumns] = useState<string[]>([]);

  const isPKTableSelected = !!mapping.primary_key_table;
  const isPKColumnSelected = !!mapping.primary_key_column;

  const handlePKTableChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onChange && onChange({ primary_key_table: event.target.value as string });
  };
  const handlePKColumnChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    onChange && onChange({ primary_key_column: event.target.value as string });
  };

  useEffect(() => {
    if (owner && owner?.schema) {
      const schema = owner.schema as Record<string, string[]>;
      if (mapping.primary_key_table) {
        onChange && onChange({ primary_key_column: undefined });
        setPKColumns(schema[mapping.primary_key_table]);
      }
    }
  }, [owner, mapping.primary_key_table]);

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={2}>
        <Grid item container spacing={2} xs={12}>
          <Grid item>
            <Select
              className={clsx({
                [classes.inputSelected]: isPKTableSelected,
              })}
              value={mapping.primary_key_table ?? ""}
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
              className={clsx(classes.icon, {
                [classes.inputSelected]: isPKColumnSelected,
              })}
              value={mapping.primary_key_column ?? ""}
              options={PKColumns}
              emptyOption={t("selectPrimaryIdentifier")}
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
        </Grid>
        <Grid item>
          <Button
            className={classes.button}
            startIcon={<AddIcon />}
            variant="outlined"
          >
            <Typography>{t("addFilter")}</Typography>
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TableStep;
