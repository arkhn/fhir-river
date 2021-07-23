import React, { useEffect } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, IconButton, makeStyles } from "@material-ui/core";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelect";
import {
  columnAdded,
  columnUpdated,
  columnSelectors,
  PendingColumn,
} from "features/Columns/columnSlice";
import CleaningScriptButton from "features/Scripts/CleaningScriptButton";
import {
  useApiColumnsListQuery,
  useApiColumnsCreateMutation,
  useApiColumnsUpdateMutation,
  useApiInputsDestroyMutation,
  useApiInputsUpdateMutation,
} from "services/api/endpoints";
import {
  ColumnRequest,
  Input as InputType,
  Scripts,
} from "services/api/generated/api.generated";

type InputProps = {
  input: InputType;
};

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme.palette.text.primary,
  },
  iconSelected: {
    fill: theme.palette.primary.main,
  },
  button: {
    textTransform: "none",
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
}));

const SqlInput = ({ input }: InputProps): JSX.Element => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [deleteInput] = useApiInputsDestroyMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [updateColumn] = useApiColumnsUpdateMutation();
  const [updateInput] = useApiInputsUpdateMutation();
  const { data: inputColumns, isSuccess } = useApiColumnsListQuery({
    input: input.id,
  });
  const inputColumn = useAppSelector((state) =>
    columnSelectors
      .selectAll(state)
      .find((column) => column?.input === input.id)
  );

  useEffect(() => {
    if (inputColumns && !inputColumn) {
      if (inputColumns[0]) {
        dispatch(columnAdded({ ...inputColumns[0], pending: false }));
      } else if (isSuccess && inputColumns.length === 0) {
        dispatch(columnAdded({ id: uuid(), input: input.id, pending: true }));
      }
    }
  }, [inputColumns, dispatch, inputColumn, input.id, isSuccess]);

  const handleDeleteInput = async () => {
    try {
      await deleteInput({ id: input.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleColumnChange = async (column: PendingColumn) => {
    if (column.id) {
      dispatch(columnUpdated({ id: column.id, changes: column }));
    }

    if (column.id && column.table && column.column && column.owner) {
      try {
        const newColumn = column.pending
          ? await createColumn({
              columnRequest: column as ColumnRequest,
            }).unwrap()
          : await updateColumn({
              id: column.id,
              columnRequest: column as ColumnRequest,
            }).unwrap();

        dispatch(
          columnUpdated({
            id: column.id,
            changes: { ...newColumn, pending: false },
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleScriptChange = async (script: Scripts | null) => {
    try {
      await updateInput({
        id: input.id,
        inputRequest: { ...input, script: script ? script.name : "" },
      });
    } catch (error) {
      // TODO: Handle errors nicely
      console.error(error);
    }
  };

  return (
    <Grid item container alignItems="center" direction="row" spacing={1}>
      <Grid item spacing={1} container className={classes.columnSelect}>
        <ColumnSelects
          pendingColumn={inputColumn ?? {}}
          onChange={handleColumnChange}
        />
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
  );
};

export default SqlInput;
