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
  CircularProgress,
} from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import ReactJson from "react-json-view";
import { useHistory, useParams } from "react-router-dom";

import MappingHeader from "app/routes/Sources/Mappings/MappingHeader";
import Alert from "common/components/Alert";
import {
  useApiResourcesRetrieveQuery,
  usePagaiExploreRetrieveQuery,
  useApiOwnersRetrieveQuery,
  useApiPreviewCreateMutation,
} from "services/api/endpoints";

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

type Exploration = { fields: string[]; rows: string[][] };

const Preview = (): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);

  const [preview, setPreview] = useState<Record<string, unknown> | undefined>(
    undefined
  );

  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  const { data: owner } = useApiOwnersRetrieveQuery(
    {
      id: mapping?.primary_key_owner ?? "",
    },
    { skip: !mapping }
  );

  const {
    data: exploration,
    isLoading: isExplorationLoading,
  } = usePagaiExploreRetrieveQuery(
    {
      resourceId: mapping?.id ?? "",
      owner: owner?.name ?? "",
      table: mapping?.primary_key_table ?? "",
    },
    { skip: !mapping || !owner }
  );

  const [apiPreviewCreate] = useApiPreviewCreateMutation();

  const handleFhirIconClick = (index: number) => async () => {
    const primaryKey = mapping?.primary_key_table;
    if (exploration && primaryKey && mapping) {
      const primaryKeyIndex = (exploration as Exploration).fields.indexOf(
        primaryKey
      );
      const primaryKeyValue = (exploration as Exploration).rows[index]?.[
        primaryKeyIndex
      ];
      try {
        const previewResult = await apiPreviewCreate({
          previewRequest: {
            resource_id: mapping?.id,
            primary_key_values: [primaryKeyValue ?? ""],
          },
        }).unwrap();
        setPreview(previewResult);
      } catch (e) {
        setAlert(e.message);
      }
    }
  };

  const handleCancelClick = () => {
    history.goBack();
  };

  if (isExplorationLoading) return <CircularProgress />;
  return (
    <>
      <MappingHeader />

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
                <TableCell className={classes.cells} />
                {exploration &&
                  (exploration as Exploration).fields.map((field, index) => (
                    <TableCell
                      className={classes.cells}
                      key={`exploration-field-${index}`}
                    >
                      {field}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            {exploration && (
              <TableBody>
                {(exploration as Exploration).rows.map((columnData, index) => (
                  <TableRow
                    hover
                    key={`exploration-row-${index}`}
                    className={classes.rowBorder}
                  >
                    <TableCell
                      className={clsx(classes.fhirIconCell, classes.cellsTitle)}
                      onClick={handleFhirIconClick(index)}
                    >
                      <IconButton size="small" className={classes.icon}>
                        <Icon
                          icon={IconNames.FLAME}
                          iconSize={15}
                          className={classes.iconFlame}
                        />
                      </IconButton>
                    </TableCell>
                    {columnData.map((cell, i) => (
                      <TableCell className={classes.cells} key={i}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <Alert
          severity="error"
          open={!!alert}
          onClose={handleAlertClose}
          message={alert}
        />
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
    </>
  );
};

export default Preview;
