import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { CircularProgress, Container, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import StepPanel from "common/components/Stepper/StepPanel";
import { columnSelectors, columnsRemoved } from "features/Columns/columnSlice";
import { filterSelectors, filtersRemoved } from "features/Filters/filterSlice";
import {
  sqlInputSelectors,
  sqlInputsRemoved,
} from "features/Inputs/sqlInputSlice";
import { joinSelectors, joinsRemoved } from "features/Joins/joinSlice";
import FhirProfileStep from "features/Mappings/Create/FhirProfileStep";
import FhirResourceStep from "features/Mappings/Create/FhirResourceStep";
import MappingCreationStepper from "features/Mappings/Create/MappingCreationStepper";
import MappingNameStep from "features/Mappings/Create/MappingNameStep";
import TableStep from "features/Mappings/Create/TableStep";
import {
  useApiFiltersCreateMutation,
  useApiResourcesCreateMutation,
  useApiColumnsCreateMutation,
  useApiJoinsCreateMutation,
  useApiSqlInputsCreateMutation,
} from "services/api/endpoints";
import type {
  ResourceRequest,
  ColumnRequest,
  FilterRequest,
  JoinRequest,
  SqlInputRequest,
} from "services/api/generated/api.generated";

import {
  resourcesRemoved,
  resourceSelectors,
  resourceAdded,
} from "../resourceSlice";

const useStyles = makeStyles((theme) => ({
  footerContainer: {
    height: theme.mixins.footer.height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    width: "100%",
  },
  rootContainer: {
    height: `calc(100vh - ${
      Number(theme.mixins.footer.height) + Number(theme.mixins.appbar.height)
    }px)`,
  },
  scrollContainer: {
    paddingTop: theme.spacing(8),
    overflowY: "auto",
  },
  button: {
    margin: theme.spacing(2),
  },
  absolute: {
    position: "absolute",
    zIndex: 1,
  },
}));

const CreateMapping = (): JSX.Element => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();
  const stepperRef = useRef<HTMLDivElement>();
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);

  const [mapping] = useAppSelector(resourceSelectors.selectAll);
  const columns = useAppSelector(columnSelectors.selectAll);
  const sqlInputs = useAppSelector(sqlInputSelectors.selectAll);
  const filters = useAppSelector(filterSelectors.selectAll);
  const joins = useAppSelector(joinSelectors.selectAll);

  const [
    createMapping,
    { isLoading: isCreateMappingLoading },
  ] = useApiResourcesCreateMutation();
  const [createSqlInput] = useApiSqlInputsCreateMutation();
  const [createFilter] = useApiFiltersCreateMutation();
  const [createColumn] = useApiColumnsCreateMutation();
  const [createJoin] = useApiJoinsCreateMutation();

  const isNextDisabled = useMemo((): boolean => {
    let isDisabled = true;

    if (mapping) {
      switch (activeStep) {
        case 0:
          isDisabled =
            mapping.primary_key_table === undefined ||
            mapping.primary_key_column === undefined;
          break;
        case 1:
          isDisabled = mapping.definition_id === undefined;
          break;
        case 2:
          isDisabled = mapping.definition_id === undefined;
          break;
        case 3:
          isDisabled =
            mapping.definition_id === undefined ||
            mapping.primary_key_table === undefined ||
            mapping.primary_key_column === undefined;
          break;

        default:
          break;
      }
    }

    return isDisabled;
  }, [activeStep, mapping]);

  const resetCreateMapping = useCallback(() => {
    dispatch(resourcesRemoved());
    dispatch(sqlInputsRemoved());
    dispatch(filtersRemoved());
    dispatch(columnsRemoved());
    dispatch(joinsRemoved());
  }, [dispatch]);

  const handleSubmitCreation = async () => {
    if (mapping) {
      try {
        const createdMapping = await createMapping({
          resourceRequest: {
            ...mapping,
          } as ResourceRequest,
        }).unwrap();

        const referencedColumns = columns.filter(
          ({ id }) =>
            sqlInputs.some(({ column }) => column === id) ||
            joins.some(({ left, right }) => left === id || right === id)
        );

        try {
          // Columns creation
          const createdColumns = await Promise.all(
            referencedColumns.map((column) =>
              createColumn({
                columnRequest: { ...column } as ColumnRequest,
              }).unwrap()
            )
          );

          // SqlInput creation
          const createdSqlInputs = await Promise.all(
            sqlInputs.map((sqlInput) => {
              const index = referencedColumns.findIndex(
                (column) => column.id === sqlInput.column
              );
              return createSqlInput({
                sqlInputRequest: {
                  ...sqlInput,
                  column: createdColumns[index]?.id ?? "",
                } as SqlInputRequest,
              }).unwrap();
            })
          );

          // Filters creation
          await Promise.all(
            filters.map((filter) => {
              const index = sqlInputs.findIndex(
                (sqlInput) => sqlInput.id === filter.sql_input
              );
              return createFilter({
                filterRequest: {
                  ...filter,
                  resource: createdMapping.id,
                  sql_input: createdSqlInputs[index]?.id ?? "",
                } as FilterRequest,
              }).unwrap();
            })
          );

          // Joins creation
          await Promise.all(
            joins.map((join) => {
              const index = sqlInputs.findIndex(
                (sqlInput) => sqlInput.id === join.sql_input
              );
              const leftColumnIndex = referencedColumns.findIndex(
                ({ id }) => id === join.left
              );
              const rightColumnIndex = referencedColumns.findIndex(
                ({ id }) => id === join.right
              );
              return createJoin({
                joinRequest: {
                  sql_input: createdSqlInputs[index]?.id ?? "",
                  left: createdColumns[leftColumnIndex]?.id ?? "",
                  right: createdColumns[rightColumnIndex]?.id ?? "",
                } as JoinRequest,
              }).unwrap();
            })
          );
        } catch (e) {
          enqueueSnackbar(e.error, { variant: "error" });
        }

        resetCreateMapping();
        history.push(`/projects/${projectId}/mappings/${createdMapping.id}`);
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
    }
  };

  const handleCancelClick = () => {
    history.goBack();
  };

  useEffect(() => {
    dispatch(
      resourceAdded({
        id: uuid(),
        project: projectId,
      })
    );
  }, [dispatch, projectId]);
  useEffect(() => resetCreateMapping, [resetCreateMapping]);

  const handlePrevStep = () => {
    activeStep > 0 && setActiveStep(activeStep - 1);
  };
  const handleNextStep = () => {
    activeStep < 3 && setActiveStep(activeStep + 1);
    activeStep === 3 && handleSubmitCreation();
  };

  return (
    <>
      <Button
        className={clsx(classes.button, classes.absolute)}
        startIcon={<Icon icon={IconNames.CHEVRON_LEFT} />}
        onClick={handleCancelClick}
        disableRipple
        color="inherit"
      >
        {t("cancel")}
      </Button>
      <Container className={classes.rootContainer} maxWidth="lg">
        <MappingCreationStepper ref={stepperRef} activeStep={activeStep} />
        {mapping && (
          <div
            className={classes.scrollContainer}
            style={{
              height: `calc(100% - ${stepperRef.current?.clientHeight}px)`,
            }}
          >
            <StepPanel index={0} value={activeStep}>
              <TableStep mapping={mapping} />
            </StepPanel>
            <StepPanel index={1} value={activeStep}>
              <FhirResourceStep mapping={mapping} />
            </StepPanel>
            <StepPanel index={2} value={activeStep}>
              <FhirProfileStep mapping={mapping} />
            </StepPanel>
            <StepPanel index={3} value={activeStep}>
              <MappingNameStep mapping={mapping} />
            </StepPanel>
          </div>
        )}
      </Container>
      <div className={classes.footerContainer}>
        <Button
          className={classes.button}
          onClick={handlePrevStep}
          disableRipple
          color="inherit"
        >
          {t("previousStep")}
        </Button>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={handleNextStep}
          disabled={isNextDisabled || isCreateMappingLoading}
        >
          {isCreateMappingLoading ? (
            <CircularProgress color="inherit" size={23} />
          ) : (
            t("next")
          )}
        </Button>
      </div>
    </>
  );
};

export default CreateMapping;
