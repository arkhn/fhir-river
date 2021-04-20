import React from "react";

import { CircularProgress, Table, TableBody } from "@material-ui/core";
import { useParams } from "react-router";

import TableContainer from "common/TableContainer/TableContainer";
import { useApiResourcesListQuery } from "services/api/endpoints";

import MappingRow from "./MappingRow";

const MappingsTable = (): JSX.Element => {
  const { sourceId } = useParams<{ sourceId?: string }>();

  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useApiResourcesListQuery({ source: sourceId });

  return isMappingLoading ? (
    <CircularProgress />
  ) : (
    <TableContainer>
      <Table>
        <TableBody>
          {mappings &&
            mappings.map((mapping) => (
              <MappingRow mapping={mapping} key={mapping.id} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MappingsTable;
