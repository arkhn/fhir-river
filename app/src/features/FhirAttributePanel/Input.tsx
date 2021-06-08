import React, { useState } from "react";

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

import ColumnSelects from "features/Columns/ColumnSelect";
import { Column } from "services/api/generated/api.generated";

type InputProps = {
  input: Partial<Column>;
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
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    width: "100%",
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
}));

const Input = ({ input }: InputProps): JSX.Element => {
  const [mappingColumn, setMappingColumn] = useState<Partial<Column>>({});
  const { t } = useTranslation();
  const classes = useStyles();
  console.log(input);

  const handleDeleteInput = () => {
    //
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
            pendingColumn={mappingColumn}
            onChange={setMappingColumn}
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
