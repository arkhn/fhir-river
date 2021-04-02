import React from "react";

import { CircularProgress, Table, TableBody } from "@material-ui/core";
import { useParams } from "react-router";

import TableContainer from "common/TableContainer/TableContainer";
import {
  useListSourceResources,
  useRetrieveSourceQuery,
} from "services/api/api";

import MappingRow from "./MappingRow";

const MappingsTable = (): JSX.Element => {
  const { sourceId } = useParams<{ sourceId?: string }>();

  if (!sourceId) {
    return <></>;
  }

  const { data: source } = useRetrieveSourceQuery({ id: sourceId ?? "" });
  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useListSourceResources(source);
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
