import React, { useEffect } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Grid,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import differenceBy from "lodash/differenceBy";
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";
import {
  conditionAdded,
  conditionsAdded,
  conditionSelectors,
} from "features/Conditions/conditionSlice";
import MergingScript from "features/Scripts/MergingScript";
import {
  useApiInputGroupsDestroyMutation,
  useApiInputsCreateMutation,
  useApiInputsListQuery,
  useApiConditionsListQuery,
  useApiInputGroupsUpdateMutation,
} from "services/api/endpoints";
import { InputGroup } from "services/api/generated/api.generated";

import Condition from "./Condition";
import SqlInput from "./SqlInput";
import StaticInput from "./StaticInput";

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
  isConditionRequired,
}: AttributeInputGroupProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const popupState = usePopupState({
    variant: "popover",
    popupId: "popup",
  });
  const [deleteInputGroups] = useApiInputGroupsDestroyMutation();
  const [updateInputGroups] = useApiInputGroupsUpdateMutation();
  const [createInput] = useApiInputsCreateMutation();
  const { data: inputs } = useApiInputsListQuery({ inputGroup: inputGroup.id });
  const {
    data: apiConditions,
    isError,
    isFetching,
  } = useApiConditionsListQuery({
    inputGroup: inputGroup.id,
  });
  const conditions = useAppSelector((state) =>
    conditionSelectors
      .selectAll(state)
      .filter((condition) => condition.input_group === inputGroup.id)
  );

  useEffect(() => {
    if (apiConditions && !isError && !isFetching) {
      const conditionDiff = differenceBy(
        apiConditions,
        conditions,
        (condition) => condition.id
      );
      if (conditions.length === 0 && isConditionRequired) {
        dispatch(
          conditionAdded({
            id: uuid(),
            action: "INCLUDE",
            input_group: inputGroup.id,
            pending: true,
          })
        );
      }
      if (conditionDiff.length > 0) {
        dispatch(
          conditionsAdded(
            conditionDiff.map((condition) => ({ ...condition, pending: false }))
          )
        );
      }
    }
  }, [
    apiConditions,
    conditions,
    dispatch,
    isError,
    isFetching,
    isConditionRequired,
    inputGroup,
  ]);

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
      //
    }
  };

  const handleCreateInput = async (isStatic: boolean) => {
    try {
      await createInput({
        inputRequest: {
          input_group: inputGroup.id,
          static_value: isStatic ? "" : null,
        },
      });
    } catch (error) {
      //
    }
  };

  const handleCreateCondition = () => {
    dispatch(
      conditionAdded({
        id: uuid(),
        action: "INCLUDE",
        input_group: inputGroup.id,
        pending: true,
      })
    );
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    popupState.open(e);
  };

  const handleAddSqlInput = () => {
    handleCreateInput(false);
    popupState.close();
  };
  const handleAddStaticInput = () => {
    handleCreateInput(true);
    popupState.close();
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
                <Typography>{t("addInput")}</Typography>
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
                    onClick={handleAddStaticInput}
                  />
                </MenuItem>
                <MenuItem>
                  <ListItemText
                    primary={t("fromAColumn")}
                    onClick={handleAddSqlInput}
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
                <Typography>{t("addCondition")}</Typography>
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
                <Typography>{t("deleteGroup")}</Typography>
              </Button>
            </Grid>
          </Grid>
          <Grid item container spacing={1}>
            {inputs &&
              inputs.map((input) =>
                input.static_value === null ? (
                  <SqlInput input={input} key={input.id} />
                ) : (
                  <StaticInput input={input} key={input.id} />
                )
              )}
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
              conditions.map((condition) => (
                <Condition condition={condition} key={condition.id} />
              ))}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AttributeInputGroup;
