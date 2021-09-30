import React, { useEffect } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Grid,
  Typography,
  IconButton,
  makeStyles,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Select from "common/components/Select";
import ColumnSelects from "features/Columns/ColumnSelect";
import useColumn from "features/Columns/useColumn";
import useCondition from "features/Conditions/useCondition";
import useSqlInput from "features/Inputs/useSqlInput";
import SqlInputJoinList from "features/Joins/SqlInputJoinList";
import useCurrentMapping from "features/Mappings/useCurrentMapping";
import {
  useApiColumnsRetrieveQuery,
  useApiSqlInputsRetrieveQuery,
} from "services/api/endpoints";
import type {
  Condition as ConditionType,
  ConditionRelationEnum,
} from "services/api/generated/api.generated";

const CONDITION_RELATIONS: ConditionRelationEnum[] = [
  "EQ",
  "GE",
  "GT",
  "LE",
  "LT",
  "NOTNULL",
  "NULL",
];

const useStyles = makeStyles((theme) => ({
  conditionContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  badgeLabel: {
    backgroundColor: theme.palette.purple.main,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
  },
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
    },
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  leftShift: {
    paddingLeft: theme.spacing(5),
    width: "100%",
  },
}));

type ConditionProps = {
  condition: Partial<ConditionType>;
  onDelete: () => void;
};

const Condition = ({ condition, onDelete }: ConditionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const mapping = useCurrentMapping();

  const { data: apiConditionSqlInput } = useApiSqlInputsRetrieveQuery(
    {
      id: condition.sql_input ?? "",
    },
    { skip: !condition.sql_input }
  );

  const { data: apiConditionColumn } = useApiColumnsRetrieveQuery(
    {
      id: apiConditionSqlInput?.column ?? "",
    },
    { skip: !apiConditionSqlInput?.column }
  );

  const [conditionColumn, setConditionColumn] = useColumn({
    initialColumn: apiConditionColumn,
    exists: apiConditionSqlInput?.column !== undefined,
  });
  // As soon as the condition column is fetched, we set its value
  useEffect(() => {
    if (apiConditionColumn && !conditionColumn)
      setConditionColumn(apiConditionColumn);
  }, [apiConditionColumn, setConditionColumn, conditionColumn]);

  const [sqlInput, setSqlInput] = useSqlInput({
    initialSqlInput: apiConditionSqlInput,
    exists: condition.sql_input !== undefined,
  });
  // As soon as the condition sql input is fetched, we set its value
  useEffect(() => {
    if (apiConditionSqlInput && !sqlInput) {
      setSqlInput(apiConditionSqlInput);
    }
  }, [apiConditionSqlInput, setSqlInput, sqlInput]);
  // As soon as a condition column is created, we add its id to the sql input
  useEffect(() => {
    if (!sqlInput?.column && conditionColumn?.id)
      setSqlInput({ ...sqlInput, column: conditionColumn.id });
  }, [conditionColumn?.id, setSqlInput, sqlInput]);

  const [_condition, setCondition] = useCondition({
    initialCondition: condition,
  });
  // As soon as the condition sql input is created, we add its id to the condition
  useEffect(() => {
    if (!_condition?.sql_input && sqlInput?.id)
      setCondition({ ..._condition, sql_input: sqlInput.id });
  }, [_condition, setCondition, sqlInput?.id]);

  const isMappingPKTableAndConditionColumnTableDifferent =
    apiConditionColumn?.table &&
    mapping &&
    (apiConditionColumn.owner !== mapping.primary_key_owner ||
      apiConditionColumn.table !== mapping.primary_key_table);

  const hideValueInput =
    condition.relation === "NOTNULL" || condition.relation === "NULL";

  const handleRelationChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    const relation = event.target.value as ConditionRelationEnum;
    const resetConditionValue = relation === "NOTNULL" || relation === "NULL";
    setCondition({
      ..._condition,
      relation,
      value: resetConditionValue ? "" : condition.value,
    });
  };

  const handleInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCondition({
      ..._condition,
      value: event.target.value as string | undefined,
    });
  };

  if (!mapping) return <CircularProgress />;

  return (
    <Grid item container direction="column" spacing={1}>
      <Grid
        item
        container
        alignItems="center"
        spacing={1}
        justify="space-between"
      >
        <Grid container item xs={11} spacing={1} alignItems="center">
          <Grid item>
            <Typography className={classes.badgeLabel}>
              {t("condition")}
            </Typography>
          </Grid>
          <ColumnSelects
            column={conditionColumn ?? {}}
            onChange={setConditionColumn}
          />
          <Grid item>
            <Select
              value={_condition?.relation ?? ""}
              options={CONDITION_RELATIONS.map((relation) => ({
                id: relation,
                label: t(relation),
              }))}
              onChange={handleRelationChange}
              emptyOption={t("selectOperation")}
            />
          </Grid>
          <Grid item>
            {!hideValueInput && (
              <TextField
                defaultValue={_condition?.value ?? ""}
                onBlur={handleInputBlur}
                placeholder={t("typeValue")}
                variant="outlined"
                size="small"
              />
            )}
          </Grid>
        </Grid>
        <Grid item>
          <IconButton
            size="small"
            className={classes.iconButton}
            onClick={onDelete}
          >
            <Icon icon={IconNames.TRASH} className={classes.icon} />
          </IconButton>
        </Grid>
      </Grid>
      {isMappingPKTableAndConditionColumnTableDifferent && sqlInput?.id && (
        <Grid item container>
          <div className={classes.leftShift}>
            <SqlInputJoinList sqlInputId={sqlInput.id} />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default Condition;
