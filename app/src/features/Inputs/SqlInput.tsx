import React, { useEffect, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Grid,
  IconButton,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";

import ColumnSelects from "features/Columns/ColumnSelect";
import SqlInputJoinList from "features/Joins/SqlInputJoinList";
import useCurrentMapping from "features/Mappings/useCurrentMapping";
import CleaningScriptButton from "features/Scripts/CleaningScriptButton";
import {
  useApiColumnsUpdateMutation,
  useApiSqlInputsDestroyMutation,
  useApiSqlInputsUpdateMutation,
  useApiColumnsRetrieveQuery,
} from "services/api/endpoints";
import type {
  SqlInput as SqlInputType,
  Scripts,
  Column,
} from "services/api/generated/api.generated";

type SqlInputProps = {
  input: SqlInputType;
};

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.text.primary,
  },
  iconSelected: {
    fill: theme.palette.primary.main,
  },
  columnSelect: { width: "fit-content" },
  iconButtonContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
    },
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  menuPopup: {
    maxHeight: 300,
  },
  leftShift: {
    paddingLeft: theme.spacing(5),
    width: "100%",
  },
}));

const SqlInput = ({ input }: SqlInputProps): JSX.Element => {
  const classes = useStyles();

  const { data: mapping } = useCurrentMapping();

  const [inputColumn, setInputColumn] = useState<Partial<Column> | undefined>(
    undefined
  );

  const [deleteInput] = useApiSqlInputsDestroyMutation();
  const [updateInput] = useApiSqlInputsUpdateMutation();

  const [updateColumn] = useApiColumnsUpdateMutation();

  const { data: apiInputColumn } = useApiColumnsRetrieveQuery({
    id: input.column,
  });

  useEffect(() => {
    setInputColumn(apiInputColumn);
  }, [apiInputColumn]);

  const isMappingPKTableAndInputColumnTableDifferent =
    inputColumn?.owner !== mapping?.primary_key_owner ||
    inputColumn?.table !== mapping?.primary_key_table;

  const handleDeleteInput = async () => {
    await deleteInput({ id: input.id });
  };

  const handleColumnChange = async (column: Partial<Column>) => {
    if (column.id && column.table && column.column && column.owner) {
      await updateColumn({
        id: column.id,
        columnRequest: column as Column,
      }).unwrap();
    }
    setInputColumn({ ...column });
  };

  const handleScriptChange = async (script: Scripts | null) => {
    await updateInput({
      id: input.id,
      sqlInputRequest: { ...input, script: script ? script.name : "" },
    });
  };

  if (!mapping || !inputColumn) return <CircularProgress />;

  return (
    <Grid item container direction="column" spacing={1}>
      <Grid item container alignItems="center" spacing={1}>
        <Grid item spacing={1} container className={classes.columnSelect}>
          <ColumnSelects column={inputColumn} onChange={handleColumnChange} />
        </Grid>
        <Grid item>
          <CleaningScriptButton
            scriptName={input.script}
            onChange={handleScriptChange}
          />
        </Grid>
        <Grid item className={classes.iconButtonContainer}>
          <IconButton
            size="small"
            className={classes.iconButton}
            onClick={handleDeleteInput}
          >
            <Icon icon={IconNames.TRASH} className={classes.icon} />
          </IconButton>
        </Grid>
      </Grid>
      {isMappingPKTableAndInputColumnTableDifferent && (
        <Grid item container>
          <div className={classes.leftShift}>
            <SqlInputJoinList sqlInputId={input.id} />
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default SqlInput;
