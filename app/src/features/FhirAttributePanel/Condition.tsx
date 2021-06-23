import React from "react";

import { Grid, Typography, IconButton, makeStyles } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelect";
import {
  conditionRemoved,
  PendingCondition,
} from "features/Conditions/conditionSlice";
import { useApiConditionsDestroyMutation } from "services/api/endpoints";
import { Column } from "services/api/generated/api.generated";

type ConditionProps = {
  condition: PendingCondition;
};

const useStyles = makeStyles((theme) => ({
  conditionContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  badgeLabel: {
    backgroundColor: "#CC7831",
    color: "#fff",
    borderRadius: 4,
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
  },
}));

const Condition = ({ condition }: ConditionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [deleteCondition] = useApiConditionsDestroyMutation();

  const handleColumnChange = (column: Partial<Column>) => {
    console.log(column);
  };
  const handleDeleteCondition = async () => {
    !condition.pending &&
      condition.id &&
      (await deleteCondition({ id: condition.id }));
    condition.id && dispatch(conditionRemoved(condition.id));
  };

  return (
    <Grid
      item
      container
      alignItems="center"
      spacing={1}
      justify="space-between"
    >
      <Grid container item xs={10} spacing={1} alignItems="center">
        <Grid item>
          <Typography className={classes.badgeLabel}>
            {t("useThisGroupIf")}
          </Typography>
        </Grid>
        <Grid container item xs={8}>
          <Grid item spacing={1} container>
            <ColumnSelects pendingColumn={{}} onChange={handleColumnChange} />
          </Grid>
          <Grid item></Grid>
        </Grid>
      </Grid>
      <Grid item>
        <IconButton size="small" onClick={handleDeleteCondition}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default Condition;
