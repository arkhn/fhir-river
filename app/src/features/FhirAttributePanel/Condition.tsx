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
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Select from "common/components/Select";
import ColumnSelects from "features/Columns/ColumnSelect";
import {
  columnAdded,
  columnSelectors,
  columnUpdated,
  PendingColumn,
} from "features/Columns/columnSlice";
import {
  conditionRemoved,
  conditionUpdated,
  PendingCondition,
} from "features/Conditions/conditionSlice";
import {
  useApiColumnsCreateMutation,
  useApiColumnsRetrieveQuery,
  useApiColumnsUpdateMutation,
  useApiConditionsCreateMutation,
  useApiConditionsDestroyMutation,
  useApiConditionsUpdateMutation,
  useApiResourcesRetrieveQuery,
} from "services/api/endpoints";
import {
  ColumnRequest,
  ConditionRelationEnum,
  ConditionRequest,
} from "services/api/generated/api.generated";

type ConditionProps = {
  condition: PendingCondition;
};

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
}));

const Condition = ({ condition }: ConditionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [createCondition] = useApiConditionsCreateMutation();
  const [updateCondition] = useApiConditionsUpdateMutation();
  const [deleteCondition] = useApiConditionsDestroyMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [updateColumn] = useApiColumnsUpdateMutation();
  const { mappingId } = useParams<{ mappingId?: string }>();
  const { data: apiConditionColumn } = useApiColumnsRetrieveQuery(
    {
      id: condition.column ?? "",
    },
    { skip: !condition.column }
  );
  const {
    data: mapping,
    isLoading: mappingLoading,
  } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );
  const conditionColumn = useAppSelector((state) =>
    columnSelectors
      .selectAll(state)
      .find((column) => column?.id === condition.column)
  );
  const hideValueInput =
    condition.relation === "NOTNULL" || condition.relation === "NULL";

  useEffect(() => {
    if (!conditionColumn) {
      if (apiConditionColumn) {
        dispatch(columnAdded({ ...apiConditionColumn, pending: false }));
      } else if (!condition.column && mapping) {
        const pendingColumnId = uuid();
        dispatch(
          columnAdded({
            id: pendingColumnId,
            pending: true,
            table: mapping.primary_key_table,
            owner: mapping.primary_key_owner,
          })
        );
        condition.id &&
          dispatch(
            conditionUpdated({
              id: condition.id,
              changes: { column: pendingColumnId },
            })
          );
      }
    }
  }, [apiConditionColumn, conditionColumn, dispatch, condition, mapping]);

  useEffect(() => {
    const createOrUpdateCondition = async () => {
      if (
        condition.action &&
        condition.column &&
        condition.id &&
        condition.relation
      )
        if (condition.pending) {
          try {
            const newCondition = await createCondition({
              conditionRequest: condition as ConditionRequest,
            }).unwrap();
            dispatch(
              conditionUpdated({
                id: condition.id,
                changes: { ...newCondition, pending: false },
              })
            );
          } catch (error) {
            console.error(error);
          }
        } else {
          await updateCondition({
            id: condition.id,
            conditionRequest: condition as ConditionRequest,
          }).unwrap();
        }
    };

    createOrUpdateCondition();
  }, [condition, createCondition, dispatch, updateCondition]);

  const handleColumnChange = async (column: PendingColumn) => {
    if (column.id) {
      dispatch(columnUpdated({ id: column.id, changes: column }));
    }

    if (column.id && column.table && column.column && column.owner) {
      try {
        const newColumn = column.pending
          ? await createColumn({
              columnRequest: column as ColumnRequest,
            }).unwrap()
          : await updateColumn({
              id: column.id,
              columnRequest: column as ColumnRequest,
            }).unwrap();

        dispatch(
          columnUpdated({
            id: column.id,
            changes: { ...newColumn, pending: false },
          })
        );
        if (condition.id && newColumn.id !== condition.column) {
          dispatch(
            conditionUpdated({
              id: condition.id,
              changes: { column: newColumn.id },
            })
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handleDeleteCondition = async () => {
    try {
      !condition.pending &&
        condition.id &&
        (await deleteCondition({ id: condition.id }));
      condition.id && dispatch(conditionRemoved(condition.id));
    } catch (error) {
      console.error(error);
    }
  };
  const handleRelationChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (condition.id) {
      const relation = event.target.value as ConditionRelationEnum;
      const resetConditionValue = relation === "NOTNULL" || relation === "NULL";
      dispatch(
        conditionUpdated({
          id: condition.id,
          changes: {
            relation,
            value: resetConditionValue ? "" : condition.value,
          },
        })
      );
    }
  };

  const handleValueChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (condition.id)
      dispatch(
        conditionUpdated({
          id: condition.id,
          changes: { value: event.target.value as string | undefined },
        })
      );
  };

  if (mappingLoading) {
    return <CircularProgress />;
  }

  return (
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
          pendingColumn={conditionColumn ?? {}}
          onChange={handleColumnChange}
        />
        <Grid item>
          <Select
            value={condition.relation ?? ""}
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
              value={condition.value ?? ""}
              onChange={handleValueChange}
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
          onClick={handleDeleteCondition}
        >
          <Icon icon={IconNames.TRASH} className={classes.icon} />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default Condition;
