import React, { useMemo } from "react";

import { IValueSet } from "@ahryman40k/ts-fhir-types/lib/R4";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, MenuItem, Select } from "@material-ui/core";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import { useApiStaticInputsUpdateMutation } from "services/api/endpoints";
import { StaticInput } from "services/api/generated/api.generated";

type ValueSetSelectProps = {
  input: StaticInput;
  valueSet: IValueSet;
};

const useStyles = makeStyles((theme) => ({
  input: {
    maxWidth: theme.mixins.input.maxWidth,
  },
  inputStartAdornment: {
    fill: theme.palette.text.disabled,
    marginRight: theme.spacing(1),
    height: theme.spacing(2),
  },
  primaryColor: {
    fill: theme.palette.primary.main,
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
}));

const ValueSetSelect = ({
  valueSet,
  input,
}: ValueSetSelectProps): JSX.Element => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [updateInput] = useApiStaticInputsUpdateMutation();

  const valueSetOptions = useMemo(
    () =>
      valueSet.expansion?.contains?.map(({ code, display }) => ({
        code,
        display,
      })),
    [valueSet]
  );

  const handleChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    try {
      await updateInput({
        id: input.id,
        staticInputRequest: { ...input, value },
      });
    } catch (e) {
      enqueueSnackbar(e.error, { variant: "error" });
    }
  };

  const handleRenderValue = (value: unknown) => {
    const option = valueSetOptions?.find(({ code }) => code === value);
    return option?.display ?? t("selectValue");
  };

  return (
    <>
      {valueSetOptions && (
        <Select
          variant="outlined"
          margin="dense"
          fullWidth
          className={clsx(classes.input, {
            [classes.disabled]: input.value === "",
          })}
          value={input.value}
          onChange={handleChange}
          displayEmpty
          renderValue={handleRenderValue}
          startAdornment={
            <Icon
              icon={IconNames.ALIGN_LEFT}
              className={clsx(classes.inputStartAdornment, {
                [classes.primaryColor]: !!input.value,
              })}
            />
          }
        >
          {valueSetOptions.map((option, index) => (
            <MenuItem key={`${option.code}_${index}`} value={option.code}>
              {option.display}
            </MenuItem>
          ))}
        </Select>
      )}
    </>
  );
};

export default ValueSetSelect;
