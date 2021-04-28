import React from "react";

import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "app/store";
import { columnSelectors } from "features/Columns/columnSlice";
import type { Filter } from "services/api/generated/api.generated";

import JoinList from "./JoinList";

type JoinSectionProps = {
  filter: Partial<Filter>;
};

const FilterJoins = ({ filter }: JoinSectionProps): JSX.Element | null => {
  const { t } = useTranslation();

  const filterColumn = useAppSelector((state) =>
    columnSelectors.selectById(state, filter.sql_column ?? "")
  );

  if (!filterColumn) return null;
  return (
    <Grid container direction="column" spacing={1}>
      {filterColumn.join && (
        <Grid item>
          <Typography gutterBottom={false}>{t("joinOn")}</Typography>
        </Grid>
      )}
      <JoinList column={filterColumn} />
    </Grid>
  );
};

export default FilterJoins;
