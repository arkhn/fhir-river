import React, { useState, useMemo } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, IconButton, makeStyles, TextField } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import FhirResourceAutocomplete from "common/components/FhirResourceAutocomplete";
import useGetSelectedNode from "common/hooks/useGetSelectedNode";
import useIsNodeReferenceSystemURI from "common/hooks/useIsNodeReferenceSystemURI";
import ExistingURIDialog from "features/Inputs/ExistingURIDialog";
import useCurrentMapping from "features/Mappings/useCurrentMapping";
import ValueSetSelect from "features/ValueSets/ValueSetSelect";
import {
  useApiStaticInputsDestroyMutation,
  useApiStaticInputsUpdateMutation,
  useApiValueSetsRetrieveQuery,
} from "services/api/endpoints";
import { StaticInput as StaticInputType } from "services/api/generated/api.generated";

import { URI_STATIC_VALUE_PREFIX } from "../../constants";

type StaticInputProps = {
  input: StaticInputType;
};

const useStyles = makeStyles((theme) => ({
  iconButtonContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
      fill: theme.palette.getContrastText(theme.palette.background.paper),
    },
    "&.Mui-disabled > span > span": {
      fill: theme.palette.divider,
    },
    border: `1px solid ${
      theme.palette.type === "dark"
        ? theme.palette.grey[600]
        : theme.palette.grey[300]
    }`,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
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
}));

const StaticInput = ({ input }: StaticInputProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: mapping } = useCurrentMapping();
  const classes = useStyles();
  const [staticInputValue, setStaticInputValue] = useState(input.value ?? "");
  const [isExistingURIDialogOpen, setExistingURIDialogOpen] = useState(false);
  const [deleteInput] = useApiStaticInputsDestroyMutation();
  const [updateInput] = useApiStaticInputsUpdateMutation();
  const selectedNode = useGetSelectedNode();
  const isNodeReferenceSystemURI = useIsNodeReferenceSystemURI(selectedNode);

  const isNodeTypeURI = selectedNode?.type === "uri";
  const isNodeNameType = selectedNode?.name === "type";
  const isTypeURIAndNameType = isNodeNameType && isNodeTypeURI;

  const isFixedValue = useMemo(() => {
    if (selectedNode) {
      const fixedEntry = Object.entries(
        selectedNode.definitionNode.definition
      ).find(([key]) => key.startsWith("fixed"));
      return fixedEntry && fixedEntry[1] === input.value;
    }
  }, [input.value, selectedNode]);

  const isNotFixedValueOrNameTypeOrReference =
    !isFixedValue && !isNodeNameType && !isNodeReferenceSystemURI;

  const valueSetUrl = useMemo(() => {
    const nodeDefinition = selectedNode?.definitionNode.definition;
    const isBindingStrengthRequired =
      nodeDefinition?.binding?.strength === "required";

    return isBindingStrengthRequired
      ? nodeDefinition?.binding?.valueSet
      : undefined;
  }, [selectedNode?.definitionNode.definition]);

  const { data: inputValueSet } = useApiValueSetsRetrieveQuery(
    { id: "", url: valueSetUrl },
    { skip: !valueSetUrl }
  );

  const isValueSetValid = inputValueSet?.expansion?.contains?.some(
    ({ code, display }) => code !== undefined && display !== undefined
  );

  const handleDeleteInput = async () => {
    await deleteInput({ id: input.id });
  };

  const handleStaticValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setStaticInputValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (staticInputValue !== input.value) {
      await updateInput({
        id: input.id,
        staticInputRequest: { ...input, value: staticInputValue },
      });
    }
  };

  const handleGenerateURIClick = async () => {
    if (mapping) {
      const staticValue = `${URI_STATIC_VALUE_PREFIX}${mapping.logical_reference}`;

      await updateInput({
        id: input.id,
        staticInputRequest: { ...input, value: staticValue },
      });
      setStaticInputValue(staticValue);
    }
  };

  const handleFhirResourceAutocompleteChange = async (value: string) => {
    if (value !== input.value) {
      await updateInput({
        id: input.id,
        staticInputRequest: { ...input, value },
      });
    }
  };
  const handleExistingURIDialogOpen = () => {
    setExistingURIDialogOpen(true);
  };
  const handleExistingURIDialogClose = () => {
    setExistingURIDialogOpen(false);
  };
  const handleExistingURIDialogSubmit = async (mappingId: string) => {
    const staticValue = `${URI_STATIC_VALUE_PREFIX}${mappingId}`;
    await updateInput({
      id: input.id,
      staticInputRequest: { ...input, value: staticValue },
    });
    setStaticInputValue(staticValue);
  };

  return (
    <Grid container item alignItems="center" direction="row" spacing={1}>
      <Grid item container alignItems="center" xs={10} spacing={2}>
        <Grid item xs={7}>
          {isTypeURIAndNameType ? (
            <FhirResourceAutocomplete
              value={input.value ?? ""}
              onChange={handleFhirResourceAutocompleteChange}
            />
          ) : inputValueSet && isValueSetValid ? (
            <ValueSetSelect input={input} valueSet={inputValueSet} />
          ) : (
            <TextField
              variant="outlined"
              size="small"
              disabled={isFixedValue}
              fullWidth
              placeholder={t("typeStaticValueHere")}
              className={classes.input}
              value={staticInputValue}
              onChange={handleStaticValueChange}
              onBlur={handleInputBlur}
              InputProps={{
                startAdornment: (
                  <Icon
                    icon={IconNames.ALIGN_LEFT}
                    className={clsx(classes.inputStartAdornment, {
                      [classes.primaryColor]: !!staticInputValue,
                    })}
                  />
                ),
              }}
            />
          )}
        </Grid>
        {isNotFixedValueOrNameTypeOrReference && isNodeTypeURI && (
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleGenerateURIClick}
              disabled={!mapping}
            >
              {t("generateURI")}
            </Button>
          </Grid>
        )}
        {isNodeReferenceSystemURI && (
          <>
            <Grid item>
              <Button variant="outlined" onClick={handleExistingURIDialogOpen}>
                {t("chooseExistingURI")}
              </Button>
            </Grid>
            <ExistingURIDialog
              open={isExistingURIDialogOpen}
              onSubmit={handleExistingURIDialogSubmit}
              onClose={handleExistingURIDialogClose}
            />
          </>
        )}
      </Grid>
      {!isFixedValue && (
        <Grid item className={classes.iconButtonContainer}>
          <IconButton
            size="small"
            className={classes.iconButton}
            onClick={handleDeleteInput}
          >
            <Icon icon={IconNames.TRASH} />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

export default StaticInput;
