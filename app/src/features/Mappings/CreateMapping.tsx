import React, { useMemo, useRef, useState } from "react";

import {
  CircularProgress,
  Container,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { store, useAppDispatch } from "app/store";
import StepPanel from "common/Stepper/StepPanel";
import FhirProfileStep from "features/Mappings/FhirProfileStep";
import FhirResourceStep from "features/Mappings/FhirResourceStep";
import MappingCreationStepper from "features/Mappings/MappingCreationStepper";
import MappingNameStep from "features/Mappings/MappingNameStep";
import TableStep from "features/Mappings/TableStep";
import {
  useApiFiltersCreateMutation,
  useApiResourcesCreateMutation,
  useApiColumnsCreateMutation,
} from "services/api/endpoints";
import {
  ResourceRequest,
  ColumnRequest,
  FilterRequest,
} from "services/api/generated/api.generated";

import { columnSelectors, columnsRemoved } from "../Columns/columnSlice";
import { filterSelectors, filtersRemoved } from "../Filters/filterSlice";
import { resourcesRemoved, resourceSelectors } from "./resourceSlice";

const FOOTER_HEIGHT = 150;

const useStyles = makeStyles((theme) => ({
  footerContainer: {
    height: FOOTER_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    width: "100%",
  },
  rootContainer: {
    height: `calc(100vh - ${FOOTER_HEIGHT + theme.spacing(10)}px)`,
  },
  scrollContainer: {
    paddingTop: theme.spacing(8),
    overflowY: "auto",
  },
  button: {
    margin: theme.spacing(2),
    textTransform: "none",
  },
  previousButton: {
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "inherit",
      color: theme.palette.text.primary,
    },
  },
  absolute: {
    position: "absolute",
    zIndex: 1,
  },
}));

const CreateMapping = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { sourceId } = useParams<{ sourceId: string }>();
  const stepperRef = useRef<HTMLDivElement>();
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [mapping] = resourceSelectors.selectAll(store.getState());
  const columns = columnSelectors.selectAll(store.getState());
  const filters = filterSelectors.selectAll(store.getState());

  const [
    createMapping,
    { isLoading: isCreateMappingLoading },
  ] = useApiResourcesCreateMutation();
  const [createFilter] = useApiFiltersCreateMutation();
  const [createColumn] = useApiColumnsCreateMutation();

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

  const resetCreateMapping = () => {
    dispatch(resourcesRemoved());
    dispatch(filtersRemoved());
    dispatch(columnsRemoved());
  };

  const handleSubmitCreation = async () => {
    if (mapping) {
      try {
        const createdMapping = await createMapping({
          resourceRequest: {
            ...mapping,
          } as ResourceRequest,
        }).unwrap();

        try {
          // Column creation
          const createdColumns = await Promise.all(
            columns.map((column) =>
              createColumn({
                columnRequest: { ...column } as ColumnRequest,
              }).unwrap()
            )
          );

          // Filter creation
          await Promise.all(
            filters.map(({ relation, value }, index) => {
              const createdColumn = createdColumns[index];
              return createFilter({
                filterRequest: {
                  sql_column: createdColumn.id,
                  relation: relation,
                  resource: createdMapping.id,
                  value: value,
                } as FilterRequest,
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

  const handlePrevStep = () => {
    activeStep > 0 && setActiveStep(activeStep - 1);
  };
  const handleNextStep = () => {
    activeStep < 3 && setActiveStep(activeStep + 1);
    activeStep === 3 && handleSubmitCreation();
  };
  const handleCancelClick = () => {
    resetCreateMapping();
    history.goBack();
  };

  return (
    <>
      <Button
        className={clsx(
          classes.button,
          classes.previousButton,
          classes.absolute
        )}
        startIcon={<BackIcon />}
        onClick={handleCancelClick}
        disableRipple
      >
        <Typography>{t("cancel")}</Typography>
      </Button>
      <Container className={classes.rootContainer}>
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
          className={clsx(classes.button, classes.previousButton)}
          onClick={handlePrevStep}
          disableRipple
        >
          <Typography>{t("previousStep")}</Typography>
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
            <Typography>{t("next")}</Typography>
          )}
        </Button>
      </div>
    </>
  );
};

export default CreateMapping;
