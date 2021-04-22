import React, { ChangeEvent, useEffect } from "react";

import {
  Button,
  IconButton,
  Grid,
  TextField,
  makeStyles,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Select from "common/components/Select";
import ColumnSelects from "features/Columns_/ColumnSelects";
import JoinSelects from "features/Joins_/JoinSelects";
import {
  addJoin,
  deleteFilter,
  FilterPending,
} from "features/Mappings_/mappingSlice";
import { Owner, Resource } from "services/api/generated/api.generated";

const FILTER_RELATIONS = ["=", "<>", "IN", ">", ">=", "<", "<="];

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
  },
  textInput: {
    minWidth: 200,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
  },
  leftShift: {
    paddingLeft: theme.spacing(5),
    width: "100%",
  },
}));

type FilterSelectsProps = {
  mapping?: Partial<Resource>;
  filter: FilterPending;
  onChange?: (filter: FilterPending) => void;
  owner?: Owner;
};

const FilterSelects = ({
  mapping,
  filter,
  onChange,
  owner,
}: FilterSelectsProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const joins = useAppSelector(
    (state) => state.mapping.joins?.[filter.id ?? ""] ?? []
  );
  const filterColumn = filter.col ?? {};
  const { table: PKTable, column: PKColumn } = filterColumn;
  const isMappingPKTableAndFilterPKTableDifferent =
    PKTable &&
    mapping?.primary_key_table &&
    PKTable !== mapping?.primary_key_table;

  useEffect(() => {
    if (joins.length === 0 && isMappingPKTableAndFilterPKTableDifferent) {
      filter.id && dispatch(addJoin(filter.id));
    }
  }, [isMappingPKTableAndFilterPKTableDifferent]);

  const handlePKTableChange = (table?: string) => {
    onChange &&
      onChange({
        ...filter,
        col: {
          ...filterColumn,
          table,
        },
      });
  };
  const handlePKColumnChange = (column?: string) => {
    onChange &&
      onChange({
        ...filter,
        col: {
          ...filterColumn,
          column,
        },
      });
  };
  const handleRelationChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    onChange &&
      onChange({
        ...filter,
        relation: event.target.value as typeof filter.relation,
      });
  };
  const handleValueChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    onChange &&
      onChange({
        ...filter,
        value: event.target.value as string,
      });
  };
  const handleAddJoinClick = () => {
    filter.id && dispatch(addJoin(filter.id));
  };
  const handleFilterDelete = () => {
    filter.id && dispatch(deleteFilter(filter.id));
  };

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item container xs={12} spacing={2}>
        <ColumnSelects
          owner={owner}
          PKColumn={PKColumn}
          PKTable={PKTable}
          onPKTableChange={handlePKTableChange}
          onPKColumnChange={handlePKColumnChange}
        />
        <Grid item>
          <Select
            value={filter.relation ?? ""}
            options={FILTER_RELATIONS.map((relation) => ({
              id: relation,
              label: t(relation),
            }))}
            onChange={handleRelationChange}
            emptyOption={t("selectOperation")}
          />
        </Grid>
        <Grid item>
          <TextField
            className={classes.textInput}
            value={filter.value}
            onChange={handleValueChange}
            placeholder={t("typeValue")}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item>
          <IconButton onClick={handleFilterDelete}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      {joins.length > 0 && (
        <Grid item container>
          <div className={classes.leftShift}>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Typography gutterBottom={false}>{t("joinOn")}</Typography>
              </Grid>
              {joins.map((join, index) => (
                <JoinSelects
                  key={join.id}
                  filter={filter.id}
                  join={join}
                  owner={owner}
                  disableDelete={
                    Boolean(isMappingPKTableAndFilterPKTableDifferent) &&
                    index === 0
                  }
                />
              ))}
              <Grid item>
                <Button
                  className={classes.button}
                  startIcon={<AddIcon />}
                  onClick={handleAddJoinClick}
                  variant="outlined"
                >
                  <Typography>{t("addJoin")}</Typography>
                </Button>
              </Grid>
            </Grid>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default FilterSelects;
