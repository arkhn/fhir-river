import React, { useEffect } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Button,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import ColumnSelects from "features/Columns/ColumnSelect";
import {
  columnAdded,
  columnUpdated,
  columnSelectors,
} from "features/Columns/columnSlice";
import {
  useApiColumnsListQuery,
  useApiInputsDestroyMutation,
} from "services/api/endpoints";
import {
  Column,
  Input as InputType,
} from "services/api/generated/api.generated";

type InputProps = {
  input: InputType;
};

const useStyles = makeStyles((theme) => ({
  icon: {
    height: theme.spacing(2),
    fill: theme.palette.getContrastText(theme.palette.background.paper),
    marginRight: theme.spacing(0.5),
  },
  function: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    textTransform: "none",
  },
  fromColumn: {
    backgroundColor: "#444444",
    color: "#fff",
    borderRadius: 4,
    padding: "4px 8px",
  },
  columnSelect: { width: "fit-content" },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    width: "100%",
  },
}));

const Input = ({ input }: InputProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [deleteInput] = useApiInputsDestroyMutation();
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
        dispatch(columnAdded(inputColumns[0]));
      } else if (isSuccess && inputColumns.length === 0) {
        dispatch(columnAdded({ id: uuid(), input: input.id }));
      }
    }
  }, [inputColumns, dispatch, inputColumn, input.id, isSuccess]);

  const handleDeleteInput = async () => {
    try {
      await deleteInput({ id: input.id });
    } catch (error) {
      //
    }
  };

  const handleColumnChange = (column: Partial<Column>) => {
    if (column.id) {
      dispatch(columnUpdated({ id: column.id, changes: column }));
    }
  };

  return (
    <div className={classes.inputContainer}>
      <Grid container alignItems="center" direction="row" spacing={1}>
        <Grid item>
          <Typography className={classes.fromColumn}>
            {t("fromColumn")}
          </Typography>
        </Grid>
        <Grid item spacing={1} container className={classes.columnSelect}>
          <ColumnSelects
            pendingColumn={inputColumn ?? {}}
            onChange={handleColumnChange}
          />
        </Grid>
        <Grid item>
          <Button className={classes.button}>
            <div className={classes.function}>
              <Icon icon={IconNames.FUNCTION} className={classes.icon} />
              <Typography>{t("applyScript")}</Typography>
            </div>
          </Button>
        </Grid>
      </Grid>
      <IconButton size="small" onClick={handleDeleteInput}>
        <CloseRounded fontSize="small" />
      </IconButton>
    </div>
  );
};

export default Input;
