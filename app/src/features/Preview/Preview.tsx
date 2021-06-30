import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  makeStyles,
  Typography,
  IconButton,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  TableBody,
  useMediaQuery,
  Button,
} from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import ReactJson from "react-json-view";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useApiResourcesRetrieveQuery } from "services/api/endpoints";

import previewJson from "./PatientFhir.json";
import exploredData from "./previewDataMock.json";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(5),
  },
  table: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    overflowX: "scroll",
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: "none",
    borderCollapse: "separate",
    marginBottom: theme.spacing(3),
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  iconFlame: {
    fill: "#CC7831",
  },
  fhirIconCell: {
    boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    position: "sticky",
    left: 0,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    width: 25,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  cells: {
    whiteSpace: "nowrap",
    boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  texts: {
    textAlign: "center",
  },
  cellsTitle: {
    background: theme.palette.background.paper,
  },
  rowBorder: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  preview: {
    padding: 0,
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    "& > div": {
      padding: theme.spacing(3),
      borderRadius: theme.shape.borderRadius,
    },
  },
  button: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
    textTransform: "none",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
}));

const Preview = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();
  const [preview, setPreview] = useState<typeof previewJson | undefined>(
    undefined
  );

  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: mappingId === undefined }
  );

  const handleFhirIconClick = (index: number) => () => {
    const primarykey = mapping?.primary_key_table;
    if (primarykey) {
      const indexPrimaryKey = exploredData.fields.indexOf(primarykey);
      // when api will have this functionality, we will need to implement this function
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exploredRow = exploredData.rows[index]?.[indexPrimaryKey];
      setPreview(previewJson);
    }
  };

  const handleCancelClick = () => {
    history.goBack();
  };

  const FhirIconCell = () => (
    <IconButton size="small" className={classes.icon}>
      <Icon
        icon={IconNames.FLAME}
        iconSize={15}
        className={classes.iconFlame}
      />
    </IconButton>
  );

  return (
    <Container className={classes.container} maxWidth="xl">
      <Button
        className={classes.button}
        startIcon={<ArrowBack />}
        onClick={handleCancelClick}
        disableRipple
      >
        <Typography>{t("back")}</Typography>
      </Button>
      <TableContainer className={classes.table}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.cellsTitle}>
              <TableCell className={classes.cells}></TableCell>
              {exploredData.fields.map((field) => (
                <TableCell className={classes.cells} key={uuid()}>
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {exploredData.rows.map((columnData, index) => (
              <TableRow hover key={uuid()} className={clsx(classes.rowBorder)}>
                <TableCell
                  className={clsx(classes.fhirIconCell, classes.cellsTitle)}
                  onClick={handleFhirIconClick(index)}
                >
                  <FhirIconCell />
                </TableCell>
                {columnData.map((cell, i) => (
                  <TableCell className={classes.cells} key={i}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {preview ? (
        <div className={classes.preview}>
          <ReactJson
            src={preview}
            theme={prefersDarkMode ? "summerfruit" : "summerfruit:inverted"}
            collapsed={1}
            displayObjectSize={false}
            displayDataTypes={false}
          />
        </div>
      ) : (
        <div className={classes.texts}>
          <Typography>
            {t("clickOnAFireIcon")}{" "}
            <Icon icon={IconNames.FLAME} className={classes.iconFlame} />{" "}
            {t("inOrderToPreview")}
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default Preview;
