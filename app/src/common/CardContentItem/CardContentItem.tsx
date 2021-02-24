import React from "react";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  sourceDetail: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
}));

type CardContentItemProps = {
  startAdornment?: React.ReactNode;
  label?: React.ReactNode;
};

const CardContentItem = ({ label, startAdornment }: CardContentItemProps) => {
  const classes = useStyles();
  return (
    <div className={classes.sourceDetail}>
      {startAdornment}
      <Typography color="textSecondary">{label}</Typography>
    </div>
  );
};

export default CardContentItem;
