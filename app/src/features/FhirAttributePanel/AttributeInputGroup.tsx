import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Grid,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import Condition from "features/Conditions/Condition";
import SqlInput from "features/Inputs/SqlInput";
import StaticInput from "features/Inputs/StaticInput";
import useCurrentMapping from "features/Mappings/useCurrentMapping";
import MergingScript from "features/Scripts/MergingScript";
import {
  useApiInputGroupsDestroyMutation,
  useApiSqlInputsCreateMutation,
  useApiStaticInputsCreateMutation,
  useApiStaticInputsListQuery,
  useApiSqlInputsListQuery,
  useApiConditionsListQuery,
  useApiInputGroupsUpdateMutation,
  useApiColumnsCreateMutation,
  useApiConditionsDestroyMutation,
} from "services/api/endpoints";
import type {
  Condition as ConditionType,
  InputGroup,
  SQLInput,
  StaticInput as StaticInputType,
} from "services/api/generated/api.generated";

type AttributeInputGroupProps = {
  inputGroup: InputGroup;
  inputGroupIndex: number;
};

const useStyles = makeStyles((theme) => ({
  inputGoupContainer: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  button: {
    textTransform: "none",
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  buttonDeleteContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row-reverse",
  },
  deleteIcon: {
    fill: theme.palette.text.primary,
  },
  buttonsContainer: {
    position: "relative",
    top: theme.spacing(-4.4),
  },
  conditionListContainer: {
    marginTop: theme.spacing(3),
  },
}));

const AttributeInputGroup = ({
  inputGroup,
  inputGroupIndex,
}: AttributeInputGroupProps): JSX.Element => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "popup",
  });

  const mapping = useCurrentMapping();

  const [deleteInputGroups] = useApiInputGroupsDestroyMutation();
  const [updateInputGroups] = useApiInputGroupsUpdateMutation();

  const [conditions, setConditions] = useState<Partial<ConditionType>[]>([]);

  const [createColumn] = useApiColumnsCreateMutation();

  const [createStaticInput] = useApiStaticInputsCreateMutation();
  const [createSqlInput] = useApiSqlInputsCreateMutation();

  const [deleteCondition] = useApiConditionsDestroyMutation();

  const {
    data: sqlInputs,
    isLoading: isSqlInputsLoading,
  } = useApiSqlInputsListQuery({
    inputGroup: inputGroup.id,
  });
  const {
    data: staticInputs,
    isLoading: isStaticInputsLoading,
  } = useApiStaticInputsListQuery({
    inputGroup: inputGroup.id,
  });

  const inputs: (SQLInput | StaticInputType)[] | undefined = useMemo(() => {
    if (isSqlInputsLoading || isStaticInputsLoading) {
      return;
    }
    if (!sqlInputs) return staticInputs;
    if (!staticInputs) return sqlInputs;
    return [...sqlInputs, ...staticInputs].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }, [isSqlInputsLoading, isStaticInputsLoading, sqlInputs, staticInputs]);

  const {
    data: apiConditions,
    isSuccess: hasApiConditionsLoaded,
  } = useApiConditionsListQuery({
    inputGroup: inputGroup.id,
  });

  // After conditions have been fetched from the api, update the total list of conditions
  useEffect(() => {
    if (apiConditions) setConditions([...apiConditions]);
  }, [apiConditions]);

  useEffect(() => {
    if (inputs && inputs.length <= 1 && inputGroup.merging_script !== "") {
      updateInputGroups({
        id: inputGroup.id,
        inputGroupRequest: { ...inputGroup, merging_script: "" },
      });
    }
  }, [inputs, inputGroup, updateInputGroups]);

  const handleDeleteInputGroup = async () => {
    try {
      await deleteInputGroups({
        id: inputGroup.id,
      }).unwrap();
    } catch (e) {
      enqueueSnackbar(e.error, { variant: "error" });
    }
  };

  const handleCreateCondition = useCallback(() => {
    const newCondition: Partial<ConditionType> = {
      input_group: inputGroup.id,
      action: "INCLUDE",
    };
    setConditions([...conditions, newCondition]);
  }, [conditions, inputGroup.id]);

  // Auto-create a condition when none exists for InputGroups with index > 0
  useEffect(() => {
    const isInputGroupConditionsEmpty =
      apiConditions?.length === 0 && conditions.length === 0;
    if (
      hasApiConditionsLoaded &&
      isInputGroupConditionsEmpty &&
      inputGroupIndex > 0
    ) {
      handleCreateCondition();
    }
  }, [
    apiConditions?.length,
    conditions.length,
    handleCreateCondition,
    hasApiConditionsLoaded,
    inputGroupIndex,
  ]);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    popupState.open(e);

  const handleCreateSqlInput = async () => {
    if (mapping) {
      try {
        const inputColumn = await createColumn({
          columnRequest: {
            table: mapping.primary_key_table,
            column: mapping.primary_key_column,
            owner: mapping.primary_key_owner,
          },
        }).unwrap();
        await createSqlInput({
          sqlInputRequest: {
            input_group: inputGroup.id,
            column: inputColumn.id,
          },
        }).unwrap();
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
      popupState.close();
    }
  };

  const handleCreateStaticInput = async () => {
    try {
      await createStaticInput({
        staticInputRequest: {
          input_group: inputGroup.id,
          value: "",
        },
      });
    } catch (error) {
      //
    }
    popupState.close();
  };

  const handleConditionDelete = (index: number) => () => {
    const conditionToDelete = conditions[index];
    if (conditionToDelete?.id) {
      deleteCondition({ id: conditionToDelete.id });
    } else {
      setConditions(conditions.filter((_, _index) => _index !== index));
    }
  };

  return (
    <Grid item className={classes.inputGoupContainer}>
      <Paper variant="outlined" className={classes.paper}>
        <Grid container direction="column" spacing={1}>
          <Grid
            item
            container
            alignItems="center"
            spacing={2}
            className={classes.buttonsContainer}
          >
            <Grid item>
              <Button
                {...bindTrigger(popupState)}
                size="small"
                variant={"outlined"}
                className={classes.button}
                startIcon={<Add />}
                onClick={handleMenuClick}
              >
                {t("addInput")}
              </Button>
              <Menu
                {...bindMenu(popupState)}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <MenuItem>
                  <ListItemText
                    primary={t("static")}
                    onClick={handleCreateStaticInput}
                  />
                </MenuItem>
                <MenuItem>
                  <ListItemText
                    primary={t("fromAColumn")}
                    onClick={handleCreateSqlInput}
                  />
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item>
              <Button
                size="small"
                className={classes.button}
                variant={"outlined"}
                startIcon={<Add />}
                onClick={handleCreateCondition}
              >
                {t("addCondition")}
              </Button>
            </Grid>
            <Grid item className={classes.buttonDeleteContainer}>
              <Button
                size="small"
                variant="outlined"
                className={classes.button}
                onClick={handleDeleteInputGroup}
                startIcon={
                  <Icon icon={IconNames.TRASH} className={classes.deleteIcon} />
                }
              >
                {t("deleteGroup")}
              </Button>
            </Grid>
          </Grid>
          <Grid item container spacing={1}>
            {staticInputs &&
              staticInputs.map((input) => (
                <StaticInput input={input} key={input.id} />
              ))}
            {sqlInputs &&
              sqlInputs.map((input) => (
                <SqlInput input={input} key={input.id} />
              ))}
            {inputs && inputs.length > 1 && (
              <MergingScript inputGroup={inputGroup} />
            )}
          </Grid>
          <Grid
            item
            container
            direction="column"
            spacing={1}
            className={classes.conditionListContainer}
          >
            {conditions &&
              conditions.map((condition, index) => (
                <Condition
                  condition={condition}
                  key={`${condition.id}_${index}`}
                  onDelete={handleConditionDelete(index)}
                />
              ))}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AttributeInputGroup;
