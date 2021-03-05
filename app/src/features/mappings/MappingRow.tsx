import React from "react";

import { IconButton, makeStyles, TableCell, TableRow } from "@material-ui/core";
import { Whatshot } from "@material-ui/icons";

import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles(() => ({
  icon: {
    width: 16,
    height: 16,
  },
}));

type MappingRowProps = {
  mapping: Resource;
};

const MappingRow = ({ mapping }: MappingRowProps) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell size="small">
        {mapping.primary_key_table}
        {` -> `}
        <Whatshot className={classes.icon} />
        {mapping.definition_id}
        {` · `}
        {mapping.label}
      </TableCell>
    </TableRow>
  );
};

export default MappingRow;
