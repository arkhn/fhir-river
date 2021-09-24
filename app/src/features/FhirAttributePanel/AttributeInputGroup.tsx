import React, { useEffect, useMemo, useState } from "react";

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
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import Condition from "features/Conditions/Condition";
import SqlInput from "features/Inputs/SqlInput";
import StaticInput from "features/Inputs/StaticInput";
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
  useApiResourcesRetrieveQuery,
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
  isConditionRequired: boolean;
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
}: // FIXME: isConditionRequired ?
AttributeInputGroupProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "popup",
  });
  const { mappingId } = useParams<{ mappingId?: string }>();

  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  const [deleteInputGroups] = useApiInputGroupsDestroyMutation();
  const [updateInputGroups] = useApiInputGroupsUpdateMutation();

  const [conditions, setConditions] = useState<Partial<ConditionType>[]>([]);

  const [createColumn] = useApiColumnsCreateMutation();

  const [createStaticInput] = useApiStaticInputsCreateMutation();
  const [createSqlInput] = useApiSqlInputsCreateMutation();

  const [deleteCondition] = useApiConditionsDestroyMutation();

  const { data: sqlInputs } = useApiSqlInputsListQuery({
    inputGroup: inputGroup.id,
  });
  const { data: staticInputs } = useApiStaticInputsListQuery({
    inputGroup: inputGroup.id,
  });

  const inputs: (SQLInput | StaticInputType)[] | undefined = useMemo(() => {
    if (!sqlInputs) return staticInputs;
    if (!staticInputs) return sqlInputs;
    // FIXME: DATE
    return [...sqlInputs, ...staticInputs].sort(
      (a, b) => +b.created_at - +a.created_at
    );
  }, [sqlInputs, staticInputs]);

  const { data: apiConditions } = useApiConditionsListQuery({
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
      // TODO: handle errors nicely
    }
  };

  const handleCreateCondition = () => {
    const newCondition = { input_group: inputGroup.id };
    setConditions([...conditions, newCondition]);
  };

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
      } catch (error) {
        // TODO: handle error nicely
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
