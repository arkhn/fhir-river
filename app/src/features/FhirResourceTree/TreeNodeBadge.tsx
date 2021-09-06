import React from "react";

import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

import useIsNodePending from "common/hooks/useIsNodePending";

import { ElementNode } from "./resourceTreeSlice";

const useStyles = makeStyles((theme) => ({
  badgeContainer: {
    display: "flex",
    alignItems: "center",
    paddingInline: theme.spacing(0.5, 1.2),
  },
  badge: {
    height: theme.spacing(1),
    width: theme.spacing(1),
    borderRadius: 5,
  },
  required: {
    backgroundColor: theme.palette.badges.required.main,
  },
  pending: {
    backgroundColor: theme.palette.badges.pending.main,
  },
}));

type TreeNodeBadgeProps = {
  elementNode: ElementNode;
};

const TreeNodeBadge = ({ elementNode }: TreeNodeBadgeProps): JSX.Element => {
  const classes = useStyles();
  const isPending = useIsNodePending(elementNode);
  const isRequired = elementNode.isRequired;
  return (
    <>
      {(isRequired || isPending) && (
        <div className={classes.badgeContainer}>
          <div
            className={clsx(classes.badge, {
              [classes.required]: isRequired && !isPending,
              [classes.pending]: isPending,
            })}
          />
        </div>
      )}
    </>
  );
};

export default TreeNodeBadge;
