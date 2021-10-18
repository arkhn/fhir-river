import React, { useState, useEffect, useCallback } from "react";

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
import Alert, { Color } from "@material-ui/lab/Alert";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
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
import {
  apiValidationErrorFromResponse,
  ApiValidationError,
} from "services/api/errors";
import {
  ExplorationResponse,
  OperationOutcomeIssue,
  PreviewResponse,
} from "services/api/generated/api.generated";

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
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
  alert: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
}));

// OperationOutcomeIssue with `severity` values matching the Alert prop `severity` values
type AlertOperationOutcomeIssue = Partial<
  Omit<OperationOutcomeIssue, "severity">
> & {
  severity: Color;
};

/**
 * Returns a matching Alert `severity` value from OperationOutcomeIssue
 *
 * issue.severity === "information" => "info"
 * @param issue OperationOutcomeIssue
 */
const getAlertSeverityFromOperationOutcomeIssue = (
  issue: OperationOutcomeIssue
): Color => {
  let alertSeverity: Color = "info";
  switch (issue.severity) {
    case "error":
    case "warning":
      alertSeverity = issue.severity;
      break;
    case "information":
      alertSeverity = "info";
      break;
  }
  return alertSeverity;
};

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
  const [alerts, setAlerts] = useState<
    AlertOperationOutcomeIssue[] | undefined
  >(undefined);

  const [preview, setPreview] = useState<IResource | undefined>(undefined);

  const handleAlertClose = (index: number) => {
    if (alerts) {
      const newAlerts = [...alerts];
      newAlerts.splice(index, 1);
      setAlerts(newAlerts);
    }
  };
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
  const [apiPreviewCreate] = useApiPreviewCreateMutation();

  const handleValidationError = useCallback(
    ({
      errors,
      errorStatus,
      errorField,
    }: {
      errors?: ApiValidationError<unknown>;
      errorStatus: number | "FETCH_ERROR" | "PARSING_ERROR" | "CUSTOM_ERROR";
      errorField: string;
    }) => {
      if (errors) {
        const errorEntries = Object.entries(errors);
        errorEntries.forEach(([key, text]) => {
          for (const error in text) {
            enqueueSnackbar(
              t<string>("catchValidationErrorPrompt", {
                query: errorField,
                errorStatus: errorStatus,
                errorKey: key,
                errorText: text[error],
              }),
              {
                variant: "error",
              }
            );
          }
        });
      }
    },
    [enqueueSnackbar, t]
  );

  const handleError = useCallback(
    (error: FetchBaseQueryError) => {
      const validationError = apiValidationErrorFromResponse(error);
      switch (error.status) {
        case "PARSING_ERROR":
          enqueueSnackbar(
            t<string>("catchValidationErrorPrompt", {
              query: error.status,
              errorStatus: error.originalStatus.toString(),
              errorText: error.error,
            }),
            { variant: "error" }
          );
          break;
        case "FETCH_ERROR":
        case "CUSTOM_ERROR":
          error.data &&
            enqueueSnackbar(`${error.status} : ${error.data as string}`, {
              variant: "error",
            });
          break;
        default:
          validationError &&
            handleValidationError({
              errors: validationError,
              errorStatus: error.status,
              errorField: "Preview",
            });
          break;
      }
    },
    [enqueueSnackbar, handleValidationError, t]
  );

  const handleFhirIconClick = (index: number) => async () => {
    if (exploration && mappingId && mapping?.primary_key_column) {
      const primaryKey = mapping.primary_key_column;
      // FIXME: See https://github.com/arkhn/fhir-river/issues/670
      const primaryKeyIndex = exploration.fields
        .map((field) => field.toLowerCase())
        .indexOf(primaryKey.toLowerCase());
      const primaryKeyValue = exploration.rows[index]?.[primaryKeyIndex];
      if (primaryKeyValue) {
        const previewCreate = async () => {
          try {
            const previewResult: PreviewResponse = await apiPreviewCreate({
              previewRequestRequest: {
                resource_id: mappingId,
                primary_key_values: [primaryKeyValue],
              },
            }).unwrap();
            setPreview(previewResult.instances[0]);
            if (previewResult.errors.length > 0)
              setAlerts(
                previewResult.errors.map((error) => ({
                  ...error,
                  severity: getAlertSeverityFromOperationOutcomeIssue(error),
                }))
              );
          } catch (error) {
            handleError(error as FetchBaseQueryError);
          }
        };
        previewCreate();
      }
    }
  };

  // load the data for the table preview list
  useEffect(() => {
    if (mappingId && owner && exploration === undefined) {
      setExploration(null);

      const explore = async () => {
        try {
          const _exploration = await apiExploreCreate({
            explorationRequestRequest: {
              owner: owner?.name ?? "",
              table: mapping?.primary_key_table ?? "",
              resource_id: mappingId,
            },
          }).unwrap();
          setExploration(_exploration);
        } catch (error) {
          handleError(error as FetchBaseQueryError);
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
    handleError,
    enqueueSnackbar,
  ]);

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
                      {cell.toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {alerts &&
        alerts.map((issue, index) => (
          <Alert
            key={index}
            className={classes.alert}
            severity={issue.severity}
            onClose={() => handleAlertClose(index)}
          >
            {issue.diagnostics}
          </Alert>
        ))}
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
            {t("clickOnAFireIcon")}
            <Icon icon={IconNames.FLAME} className={classes.iconFlame} />
            {t("inOrderToPreview")}
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default Preview;
