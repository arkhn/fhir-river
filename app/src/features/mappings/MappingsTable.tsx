import React from "react";

import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";

import { useListSourceResources } from "services/api/api";
import { Source } from "services/api/generated/api.generated";

import MappingRow from "./MappingRow";

type MappingsTableProps = {
  source: Source;
};

const MappingsTable = ({ source }: MappingsTableProps) => {
  const {
    data: mappings,
    isLoading: isMappingLoading,
  } = useListSourceResources(source);
  console.log(mappings);
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
