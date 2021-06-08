/* eslint-disable @typescript-eslint/no-unused-vars */
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
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import { useTranslation } from "react-i18next";

import ColumnSelects from "features/Columns/ColumnSelect";
import { Column, InputGroup } from "services/api/generated/api.generated";

type AttributeInputGroupProps = {
  inputGroup: InputGroup;
};

const useStyles = makeStyles((theme) => ({
  icons: {
    height: theme.spacing(2),
    fill: theme.palette.getContrastText(theme.palette.background.paper),
    marginRight: theme.spacing(0.5),
  },
  function: {
    display: "flex",
    alignItems: "center",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {},
  div: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  button: {
    textTransform: "none",
  },
  title: {
    backgroundColor: "#444444",
    color: "#fff",
    borderRadius: 4,
    padding: "4px 8px",
  },
}));

const AttributeInputGroup = ({
  inputGroup,
}: AttributeInputGroupProps): JSX.Element => {
  const [mappingColumn, setMappingColumn] = useState<Partial<Column>>({});
  const { t } = useTranslation();

  const classes = useStyles();
  return (
    <div className={classes.div}>
      <Grid container alignItems="center" direction="row" spacing={1}>
        <Grid item>
          <Typography className={classes.title}>{t("fromColumn")}</Typography>
        </Grid>
        <Grid item spacing={1} container style={{ width: "fit-content" }}>
          <ColumnSelects
            pendingColumn={mappingColumn}
            onChange={setMappingColumn}
          />
        </Grid>
        <Grid item>
          <Button className={classes.button}>
            <div className={classes.function}>
              <Icon icon={IconNames.FUNCTION} className={classes.icons} />
              <Typography>{t("applyScript")}</Typography>
            </div>
          </Button>
        </Grid>
      </Grid>
      <IconButton size="small" className={classes.icon}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default AttributeInputGroup;

{
  /* <div className={classes.container}>
    <div className={classes.inputGroupsInputs}>
      <Typography>{t("fromColumn")}</Typography>
      <ColumnSelects
        pendingColumn={mappingColumn}
        onChange={(a) => setMappingColumn(a)}
      />
      <Button>
        <div className={classes.function}>
          <Icon icon={IconNames.FUNCTION} className={classes.icons} />
          <Typography>{t("applyScript")}</Typography>
        </div>
      </Button>
    </div>
    <IconButton size="small">
      <CloseRoundedIcon fontSize="small" />
    </IconButton>
  </div> */
}
