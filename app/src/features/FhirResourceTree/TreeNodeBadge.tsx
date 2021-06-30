import React, { useMemo } from "react";

import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

import useIsNodePending from "common/hooks/useIsNodePending";

import { ElementNode } from "./resourceTreeSlice";
import { isTreeElementNodeRequired } from "./resourceTreeUtils";

const useStyles = makeStyles((theme) => ({
  badgeContainer: {
    display: "flex",
    alignItems: "center",
    paddingInlineEnd: theme.spacing(1.2),
    paddingInlineStart: theme.spacing(0.5),
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
  const isRequired = useMemo(() => isTreeElementNodeRequired(elementNode), [
    elementNode,
  ]);
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
