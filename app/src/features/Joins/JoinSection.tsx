import React from "react";

import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import JoinSelects from "features/Joins/JoinSelects";
import {
  addJoin,
  deleteJoin,
  PendingFilter,
  PendingJoin,
  updateJoin,
} from "features/Mappings/mappingSlice";
import { Owner } from "services/api/generated/api.generated";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

type JoinSectionProps = {
  owner?: Owner;
  filter: PendingFilter;
  joins: PendingJoin[];
  isFirstJoinRequired?: boolean;
};

const JoinSection = ({
  owner,
  filter,
  joins,
  isFirstJoinRequired,
}: JoinSectionProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleAddJoinClick = () => {
    filter.id && dispatch(addJoin(filter.id));
  };
  const handleJoinChange = (join: PendingJoin) => {
    filter.id &&
      dispatch(
        updateJoin({
          filter: filter.id,
          join,
        })
      );
  };
  const handleJoinDelete = (joinId: string) => {
    filter.id && dispatch(deleteJoin({ filter: filter.id, join: joinId }));
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
          owner={owner}
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
