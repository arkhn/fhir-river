import React, { useEffect, useMemo, useRef, useState } from "react";

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

import { useAppDispatch, useAppSelector } from "app/store";
import StepPanel from "common/Stepper/StepPanel";
import FhirProfileStep from "features/mappings/FhirProfileStep";
import FhirResourceStep from "features/mappings/FhirResourceStep";
import MappingCreationStepper from "features/mappings/MappingCreationStepper";
import MappingNameStep from "features/mappings/MappingNameStep";
import {
  initMappingCreation,
  resetMappingCreation,
  selectMappingCurrent,
  selectMappingFilters,
  updateMapping,
} from "features/mappings/mappingSlice";
import TableStep from "features/mappings/TableStep";
import {
  Column,
  Filter,
  Resource,
  useCreateColumnMutation,
  useCreateFilterMutation,
  useCreateResourceMutation,
  useListOwnersQuery,
} from "services/api/generated/api.generated";

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

const CreateMapping = (): JSX.Element => {
  const { t } = useTranslation();
  const { sourceId } = useParams<{ sourceId?: string }>();
  const stepperRef = useRef<HTMLDivElement>();
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { data: owners } = useListOwnersQuery({});
  const owner = owners?.[0];

  const [activeStep, setActiveStep] = useState(0);
  const [isProfileSelected, setIsProfileSelected] = useState(false);
  const mapping = useAppSelector(selectMappingCurrent);
  const filters = useAppSelector(selectMappingFilters);
  const [
    createMapping,
    { isLoading: isCreateMappingLoading },
  ] = useCreateResourceMutation();
  const [createFilter] = useCreateFilterMutation();
  const [createColumn] = useCreateColumnMutation();

  useEffect(() => {
    if (!mapping) {
      dispatch(initMappingCreation());
    }
  }, [dispatch, mapping]);

  useEffect(() => {
    return () => {
      dispatch(resetMappingCreation());
    };
  }, []);

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
          isDisabled =
            mapping.definition_id === undefined || !isProfileSelected;
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

  const handleSubmitCreation = async () => {
    if (mapping && owner && sourceId && filters) {
      try {
        const createdMapping = await createMapping({
          resource: {
            ...mapping,
            primary_key_owner: owner.id,
            source: sourceId,
          } as Resource,
        }).unwrap();

        for (const filter of filters) {
          try {
            const createdColumn = await createColumn({
              column: {
                ...filter.col,
                owner: owner.id,
              } as Column,
            }).unwrap();

            createFilter({
              filter: {
                sql_column: createdColumn.id,
                relation: filter.relation,
                resource: createdMapping.id,
                value: filter.value,
              } as Filter,
            });
          } catch (error) {
            // Fix: Handle Column & Filter creation errors
          }
        }

        history.push(`/source/${sourceId}/mapping/${createdMapping.id}`);
      } catch (error) {
        // Fix: Handle Resource creation errors
      }
    }
  };
  const handleUpdateMapping = (newMapping: Partial<Resource>) => {
    // Remove disable on "next" button for 3rd step
    if (activeStep === 2) {
      setIsProfileSelected(true);
    }
    dispatch(updateMapping(newMapping));
  };
  const handlePrevStep = () => {
    activeStep > 0 && setActiveStep(activeStep - 1);
  };
  const handleNextStep = () => {
    activeStep < 3 && setActiveStep(activeStep + 1);
    activeStep === 3 && handleSubmitCreation();
  };
  const handleCancelClick = () => {
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
              <TableStep
                mapping={mapping}
                onChange={handleUpdateMapping}
                owner={owner}
              />
            </StepPanel>
            <StepPanel index={1} value={activeStep}>
              <FhirResourceStep
                mapping={mapping}
                onChange={handleUpdateMapping}
              />
            </StepPanel>
            <StepPanel index={2} value={activeStep}>
              <FhirProfileStep
                mapping={mapping}
                onChange={handleUpdateMapping}
              />
            </StepPanel>
            <StepPanel index={3} value={activeStep}>
              <MappingNameStep
                mapping={mapping}
                onChange={handleUpdateMapping}
              />
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
