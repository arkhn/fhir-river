import React, { useState, useEffect } from "react";

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
import { useTranslation } from "react-i18next";
import ReactJson from "react-json-view";
import { useParams } from "react-router-dom";

import MappingHeader from "app/routes/Sources/Mappings/MappingHeader";
import Alert from "common/components/Alert";
import BackButton from "common/components/BackButton";
import useMergeConceptMapsToMappings from "common/hooks/useMergeConceptMapsToMappings";
import {
  useApiResourcesRetrieveQuery,
  useApiExploreCreateMutation,
  useApiOwnersRetrieveQuery,
  useRiverPreviewCreateMutation,
  useApiCredentialsListQuery,
} from "services/api/endpoints";
import {
  useApiSourcesExportRetrieveQuery,
  ExplorationResponse,
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
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();

  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const [exploration, setExploration] = useState<
    ExplorationResponse | null | undefined
  >(undefined);

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);

  const [preview, setPreview] = useState<Record<string, unknown> | undefined>(
    undefined
  );

  const { data: credentials } = useApiCredentialsListQuery({
    source: sourceId,
  });
  const credential = credentials?.[0];

  const {
    mappings,
    refetch: refetchMappings,
    isMappingsFetching,
  } = useApiSourcesExportRetrieveQuery(
    { id: sourceId ?? "" },
    {
      skip: !sourceId,
      selectFromResult: ({ data: mappings, isFetching }) => {
        const resource = mappings?.resources?.find(
          ({ id }) => id === mappingId
        );
        return {
          mappings: mappings &&
            credential && {
              ...mappings,
              credential: {
                ...mappings.credential,
                login: credential.login,
                password: credential.password,
              },
              resources: resource && [resource],
            },
          isMappingsFetching: isFetching,
        };
      },
    }
  );

  const mappingsWithConceptMaps = useMergeConceptMapsToMappings({ mappings });

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
    if (
      mappingsWithConceptMaps &&
      mapping &&
      owner &&
      exploration === undefined
    ) {
      setExploration(null);

      const explore = async () => {
        try {
          const exploration = await apiExploreCreate({
            explorationRequestRequest: {
              owner: owner?.name ?? "",
              table: mapping?.primary_key_table ?? "",
              mapping: mappingsWithConceptMaps,
            },
          }).unwrap();
          setExploration(exploration);
        } catch (e) {
          setAlert(e.message);
        }
      };
      explore();
    }
  }, [apiExploreCreate, exploration, mapping, mappingsWithConceptMaps, owner]);

  const [apiPreviewCreate] = useRiverPreviewCreateMutation();

  const handleFhirIconClick = (index: number) => async () => {
    refetchMappings();
    setPreviewIndex(index);
  };

  useEffect(() => {
    if (
      previewIndex > 0 &&
      !isMappingsFetching &&
      exploration &&
      mapping?.primary_key_table &&
      mappingsWithConceptMaps
    ) {
      setPreviewIndex(0);

      const primaryKey = mapping?.primary_key_table;
      const primaryKeyIndex = exploration.fields.indexOf(primaryKey);
      const primaryKeyValue = exploration.rows[previewIndex]?.[primaryKeyIndex];

      if (primaryKeyValue) {
        const previewCreate = async () => {
          try {
            const previewResult = await apiPreviewCreate({
              previewRequestRequest: {
                mapping: mappingsWithConceptMaps,
                primary_key_values: [primaryKeyValue],
              },
            }).unwrap();
            setPreview(previewResult);
          } catch (e) {
            setAlert(e.message);
          }
        };
        previewCreate();
      }
    }
  }, [
    apiPreviewCreate,
    exploration,
    isMappingsFetching,
    mapping,
    mappings,
    mappingsWithConceptMaps,
    previewIndex,
  ]);

  return (
    <>
      <MappingHeader />

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
