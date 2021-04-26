import React from "react";

import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import JoinSelects from "features/Joins/JoinSelect";
import {
  addJoin,
  deleteJoin,
  PendingJoin,
  updateJoin,
} from "features/Mappings/mappingSlice";
import { Column } from "services/api/generated/api.generated";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type JoinSectionProps = {
  column?: Partial<Column>;
  joins: PendingJoin[];
  isFirstJoinRequired?: boolean;
};

const JoinSection = ({
  column,
  joins,
  isFirstJoinRequired,
}: JoinSectionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleAddJoinClick = () => {
    column?.id && dispatch(addJoin(column.id));
  };
  const handleJoinChange = (join: PendingJoin) => {
    column?.id &&
      dispatch(
        updateJoin({
          column: column.id,
          join,
        })
      );
  };
  const handleJoinDelete = (joinId: string) => {
    column?.id && dispatch(deleteJoin({ column: column.id, join: joinId }));
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography gutterBottom={false}>{t("joinOn")}</Typography>
      </Grid>
      {joins.map((join, index) => (
        <JoinSelects
          key={join.id}
          join={join}
          onChange={handleJoinChange}
          onDelete={handleJoinDelete}
          disableDelete={isFirstJoinRequired && index === 0}
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
  );
};

export default JoinSection;
