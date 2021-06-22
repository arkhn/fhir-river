import React, { useEffect } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Button,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import clsx from "clsx";
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "app/store";
import {
  conditionAdded,
  conditionsAdded,
  conditionSelectors,
} from "features/Conditions/conditionSlice";
import {
  useApiInputGroupsDestroyMutation,
  useApiInputsCreateMutation,
  useApiInputsListQuery,
  useApiConditionsListQuery,
} from "services/api/endpoints";
import { InputGroup } from "services/api/generated/api.generated";

import Condition from "./Condition";
import SqlInput from "./SqlInput";
import StaticInput from "./StaticInput";

type AttributeInputGroupProps = {
  inputGroup: InputGroup;
};

const useStyles = makeStyles((theme) => ({
  inputGroups: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  button: {
    textTransform: "none",
    marginTop: theme.spacing(1),
  },
  buttonCondition: {
    marginTop: theme.spacing(3),
  },
  buttonDelete: {
    alignSelf: "flex-end",
  },
  deleteIcon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
  menu: {
    marginTop: theme.spacing(1),
  },
}));

const AttributeInputGroup = ({
  inputGroup,
}: AttributeInputGroupProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const popupState = usePopupState({
    variant: "popover",
    popupId: "popup",
  });
  const [deleteInputGroups] = useApiInputGroupsDestroyMutation();
  const [createInput] = useApiInputsCreateMutation();
  const { data: inputs } = useApiInputsListQuery({ inputGroup: inputGroup.id });
  const conditions = useAppSelector((state) =>
    conditionSelectors
      .selectAll(state)
      .filter((condition) => condition.input_group === inputGroup.id)
  );
  const { data: apiConditions } = useApiConditionsListQuery({
    inputGroup: inputGroup.id,
  });

  useEffect(() => {
    if (apiConditions && apiConditions.length > 0 && !conditions) {
      dispatch(
        conditionsAdded(
          apiConditions.map((condition) => ({ ...condition, pending: false }))
        )
      );
    }
  }, [apiConditions, conditions, dispatch]);

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
      conditionAdded({ id: uuid(), input_group: inputGroup.id, pending: true })
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
    <Paper className={classes.inputGroups} variant="outlined">
      {inputs &&
        inputs.map((input) =>
          input.static_value === null ? (
            <SqlInput input={input} key={input.id} />
          ) : (
            <StaticInput input={input} key={input.id} />
          )
        )}
      <Button
        {...bindTrigger(popupState)}
        size="small"
        variant={inputs && inputs.length === 0 ? "outlined" : "text"}
        className={classes.button}
        startIcon={<Add />}
        onClick={handleMenuClick}
      >
        <Typography>{t("addInput")}</Typography>
      </Button>
      <Menu
        className={classes.menu}
        {...bindMenu(popupState)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem>
          <ListItemText primary={t("static")} onClick={handleAddStaticInput} />
        </MenuItem>
        <MenuItem>
          <ListItemText
            primary={t("fromAColumn")}
            onClick={handleAddSqlInput}
          />
        </MenuItem>
      </Menu>
      {conditions &&
        conditions.map((condition) => (
          <Condition condition={condition} key={condition.id} />
        ))}
      <Button
        size="small"
        variant="outlined"
        className={clsx(classes.button, classes.buttonCondition)}
        startIcon={<Add />}
        onClick={handleCreateCondition}
      >
        <Typography>{t("addCondition")}</Typography>
      </Button>
      <Button
        size="small"
        variant="outlined"
        className={clsx(classes.button, classes.buttonDelete)}
        startIcon={
          <Icon icon={IconNames.TRASH} className={classes.deleteIcon} />
        }
      >
        <Typography onClick={handleDeleteInputGroup}>
          {t("deleteGroup")}
        </Typography>
      </Button>
    </Paper>
  );
};

export default AttributeInputGroup;
