import React from "react";

import {
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { useParams, useHistory } from "react-router";

import TableContainer from "common/TableContainer/TableContainer";
import { useApiResourcesListQuery } from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

import MappingInfo from "./MappingInfo";

const useStyles = makeStyles(() => ({
  row: {
    cursor: "pointer",
  },
}));

const MappingsTable = (): JSX.Element => {
  const classes = useStyles();
  const { sourceId } = useParams<{ sourceId?: string }>();
  const history = useHistory();

  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useApiResourcesListQuery({ source: sourceId });

  const handleMappingRowClick = (mapping: Resource) => () => {
    history.push(`/source/${sourceId}/mapping/${mapping.id}`);
  };

  return isMappingLoading ? (
    <CircularProgress />
  ) : (
    <TableContainer>
      <Table>
        <TableBody>
          {mappings &&
            mappings.map((mapping) => (
              <TableRow
                hover
                className={classes.row}
                key={mapping.id}
                onClick={handleMappingRowClick(mapping)}
              >
                <TableCell size="small">
                  <MappingInfo mapping={mapping} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MappingsTable;
