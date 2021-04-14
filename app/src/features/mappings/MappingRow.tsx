import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, TableCell, TableRow, Typography } from "@material-ui/core";
import { ArrowForward } from "@material-ui/icons";
import clsx from "clsx";

import { useListResourceFilters } from "services/api/api";
import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  row: {
    cursor: "pointer",
  },
  cell: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    width: 16,
    height: 16,
  },
  flameIcon: {
    fill: "#CC7831",
    marginRight: theme.spacing(0.5),
  },
  tableIcon: {
    fill: theme.palette.secondary.main,
    marginRight: theme.spacing(1),
  },
  text: {
    margin: theme.spacing(0.5),
  },
  definitionId: {
    fontWeight: 500,
  },
  inlineSpace: {
    marginInline: theme.spacing(1),
  },
}));

type MappingRowProps = {
  mapping: Resource;
};

const MappingRow = ({ mapping }: MappingRowProps): JSX.Element => {
  const classes = useStyles();
  const { data: filters } = useListResourceFilters(mapping);
  const filtersCount = filters?.length ?? 0;

  return (
    <TableRow hover className={classes.row}>
      <TableCell className={classes.cell} size="small">
        <Icon
          icon={IconNames.TH}
          className={clsx(classes.icon, classes.tableIcon)}
        />
        <Typography className={classes.text} color="textPrimary">
          {mapping.primary_key_table}
          {filtersCount > 0 && ` + ${filtersCount} filter(s)`}
        </Typography>
        <ArrowForward className={clsx(classes.icon, classes.inlineSpace)} />
        <Icon
          icon={IconNames.FLAME}
          className={clsx(classes.icon, classes.flameIcon)}
        />
        <Typography
          className={clsx(classes.text, classes.definitionId)}
          color="textPrimary"
        >
          {mapping.definition_id}
        </Typography>
        <Typography
          className={classes.text}
          color="textSecondary"
        >{`·`}</Typography>
        <Typography className={classes.text} color="textSecondary">
          {mapping.label}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default MappingRow;
