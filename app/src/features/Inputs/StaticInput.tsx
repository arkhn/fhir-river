import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, IconButton, makeStyles, TextField } from "@material-ui/core";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import FhirResourceAutocomplete from "common/components/FhirResourceAutocomplete";
import useGetSelectedNode from "common/hooks/useGetSelectedNode";
import useIsNodeReferenceSystemURI from "common/hooks/useIsNodeReferenceSystemURI";
import ExistingURIDialog from "features/Inputs/ExistingURIDialog";
import useCurrentMapping from "features/Mappings/useCurrentMapping";
import {
  useApiStaticInputsDestroyMutation,
  useApiStaticInputsUpdateMutation,
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
  icon: {
    fill: theme.palette.getContrastText(theme.palette.background.paper),
  },
  iconButton: {
    "& > span > span": {
      height: theme.spacing(2),
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
    maxWidth: 534,
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
  const { enqueueSnackbar } = useSnackbar();
  const { data: mapping } = useCurrentMapping();
  const classes = useStyles();
  const [staticValue, setStaticValue] = useState(input.value ?? "");
  const [isExistingURIDialogOpen, setExistingURIDialogOpen] = useState(false);
  const [deleteInput] = useApiStaticInputsDestroyMutation();
  const [updateInput] = useApiStaticInputsUpdateMutation();
  const selectedNode = useGetSelectedNode();
  const isNodeReferenceSystemURI = useIsNodeReferenceSystemURI(selectedNode);
  const isNodeTypeURI = selectedNode?.type === "uri";
  const isNodeNameType = selectedNode?.name === "type";
  const handleDeleteInput = async () => {
    try {
      await deleteInput({ id: input.id });
    } catch (e) {
      enqueueSnackbar(e.error, { variant: "error" });
    }
  };

  const handleStaticValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setStaticValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (staticValue !== input.value) {
      try {
        await updateInput({
          id: input.id,
          staticInputRequest: { ...input, value: staticValue },
        });
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
    }
  };

  const handleGenerateURIClick = async () => {
    if (mapping) {
      const staticValue = `${URI_STATIC_VALUE_PREFIX}${mapping.logical_reference}`;
      try {
        await updateInput({
          id: input.id,
          staticInputRequest: { ...input, value: staticValue },
        });
        setStaticValue(staticValue);
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
    }
  };

  const handleFhirResourceAutocompleteChange = async (value: string) => {
    if (value !== input.value) {
      try {
        await updateInput({
          id: input.id,
          staticInputRequest: { ...input, value },
        });
      } catch (e) {
        enqueueSnackbar(e.error, { variant: "error" });
      }
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
    try {
      await updateInput({
        id: input.id,
        staticInputRequest: { ...input, value: staticValue },
      });
      setStaticValue(staticValue);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Grid container item alignItems="center" direction="row" spacing={1}>
      <Grid item container alignItems="center" xs={10} spacing={2}>
        <Grid item xs={7}>
          {isNodeTypeURI && isNodeNameType ? (
            <FhirResourceAutocomplete
              value={input.value ?? ""}
              onChange={handleFhirResourceAutocompleteChange}
            />
          ) : (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder={t("typeStaticValueHere")}
              className={classes.input}
              value={staticValue}
              onChange={handleStaticValueChange}
              onBlur={handleInputBlur}
              InputProps={{
                startAdornment: (
                  <Icon
                    icon={IconNames.ALIGN_LEFT}
                    className={clsx(classes.inputStartAdornment, {
                      [classes.primaryColor]: !!staticValue,
                    })}
                  />
                ),
              }}
            />
          )}
        </Grid>
        {isNodeTypeURI && !isNodeNameType && !isNodeReferenceSystemURI && (
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
      <Grid item className={classes.iconButtonContainer}>
        <IconButton
          size="small"
          className={classes.iconButton}
          onClick={handleDeleteInput}
        >
          <Icon icon={IconNames.TRASH} className={classes.icon} />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default StaticInput;
