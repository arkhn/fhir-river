import React, { useState, useEffect } from "react";

import { IResource } from "@ahryman40k/ts-fhir-types/lib/R4";
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
} from "@material-ui/core";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import ReactJson from "react-json-view";
import { useParams } from "react-router-dom";

import BackButton from "common/components/BackButton";
import {
  useApiResourcesRetrieveQuery,
  useApiExploreCreateMutation,
  useApiOwnersRetrieveQuery,
  useApiPreviewCreateMutation,
} from "services/api/endpoints";
import { ExplorationResponse } from "services/api/generated/api.generated";

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
    fill: theme.palette.orange.main,
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
  const { enqueueSnackbar } = useSnackbar();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { mappingId } = useParams<{
    mappingId?: string;
  }>();

  const [exploration, setExploration] = useState<
    ExplorationResponse | null | undefined
  >(undefined);

  const [preview, setPreview] = useState<IResource | undefined>(undefined);

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

  const [apiExploreCreate] = useApiExploreCreateMutation();

  useEffect(() => {
    if (mappingId && owner && exploration === undefined) {
      setExploration(null);

      const explore = async () => {
        try {
          const exploration = await apiExploreCreate({
            explorationRequestRequest: {
              owner: owner?.name ?? "",
              table: mapping?.primary_key_table ?? "",
              resource_id: mappingId,
            },
          }).unwrap();
          setExploration(exploration);
        } catch (e) {
          enqueueSnackbar(e.message, { variant: "error" });
        }
      };
      explore();
    }
  }, [
    apiExploreCreate,
    exploration,
    mapping?.primary_key_table,
    mappingId,
    owner,
    enqueueSnackbar,
  ]);

  const [apiPreviewCreate] = useApiPreviewCreateMutation();

  const handleFhirIconClick = (index: number) => async () => {
    if (exploration && mappingId && mapping?.primary_key_column) {
      const primaryKey = mapping.primary_key_column;
      const primaryKeyIndex = exploration.fields.indexOf(primaryKey);
      const primaryKeyValue = exploration.rows[index]?.[primaryKeyIndex];

      if (primaryKeyValue) {
        const previewCreate = async () => {
          try {
            const previewResult = await apiPreviewCreate({
              previewRequestRequest: {
                resource_id: mappingId,
                primary_key_values: [primaryKeyValue],
              },
            }).unwrap();
            setPreview(previewResult.instances[0]);
            if (previewResult.errors.length > 0)
              enqueueSnackbar(previewResult.errors[0], { variant: "error" });
          } catch (e) {
            enqueueSnackbar(e.message, { variant: "error" });
          }
        };
        previewCreate();
      }
    }
  };

  return (
    <Container className={classes.container} maxWidth="xl">
      <BackButton className={classes.button} />
      <TableContainer className={classes.table}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.cellsTitle}>
              <TableCell className={classes.cells} />
              {exploration &&
                exploration.fields.map((field, index) => (
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
              {exploration.rows.map((columnData, index) => (
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
      {preview ? (
        <div className={classes.preview}>
          <ReactJson
            src={preview}
            theme={prefersDarkMode ? "summerfruit" : "summerfruit:inverted"}
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
