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
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import StepPanel from "common/components/Stepper/StepPanel";
import { columnSelectors, columnsRemoved } from "features/Columns/columnSlice";
import { filterSelectors, filtersRemoved } from "features/Filters/filterSlice";
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
} from "services/api/endpoints";
import type {
  ResourceRequest,
  ColumnRequest,
  FilterRequest,
  JoinRequest,
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
  const { sourceId } = useParams<{ sourceId?: string }>();
  const stepperRef = useRef<HTMLDivElement>();
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);

  const [mapping] = useAppSelector(resourceSelectors.selectAll);
  const columns = useAppSelector(columnSelectors.selectAll);
  const columnsWithoutJoin = columns.filter((column) => !Boolean(column.join));
  const columnsWithJoin = columns.filter((column) => Boolean(column.join));
  const filters = useAppSelector(filterSelectors.selectAll);
  const joins = useAppSelector(joinSelectors.selectAll);

  const [
    createMapping,
    { isLoading: isCreateMappingLoading },
  ] = useApiResourcesCreateMutation();
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

        try {
          // Columns without join creation
          const createdColumns = await Promise.all(
            columnsWithoutJoin.map((column) =>
              createColumn({
                columnRequest: { ...column } as ColumnRequest,
              }).unwrap()
            )
          );

          // Filters creation
          await Promise.all(
            filters.map((filter) => {
              const index = columnsWithoutJoin.findIndex(
                (column) => column.id === filter.sql_column
              );
              return createFilter({
                filterRequest: {
                  ...filter,
                  resource: createdMapping.id,
                  sql_column: createdColumns[index]?.id ?? "",
                } as FilterRequest,
              }).unwrap();
            })
          );

          // Joins creation
          const createdJoins = await Promise.all(
            joins.map((join) => {
              const index = columnsWithoutJoin.findIndex(
                (column) => column.id === join.column
              );
              return createJoin({
                joinRequest: {
                  column: createdColumns[index]?.id ?? "",
                } as JoinRequest,
              }).unwrap();
            })
          );

          // Join columns creation
          await Promise.all(
            columnsWithJoin.map((column) => {
              const index = joins.findIndex((join) => join.id === column.join);
              return createColumn({
                columnRequest: {
                  ...column,
                  join: createdJoins[index]?.id ?? "",
                } as ColumnRequest,
              }).unwrap();
            })
          );
        } catch (error) {
          // Fix: Handle Column & Filter creation errors
        }

        resetCreateMapping();
        history.push(`/sources/${sourceId}/mappings/${createdMapping.id}`);
      } catch (error) {
        // Fix: Handle Resource creation errors
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
        source: sourceId,
      })
    );
  }, [dispatch, sourceId]);
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
