import React, { useMemo, useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Grid, IconButton, makeStyles, TextField } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Button from "common/components/Button";
import useGetSelectedNode from "common/hooks/useGetSelectedNode";
import {
  useApiInputsDestroyMutation,
  useApiInputsUpdateMutation,
} from "services/api/endpoints";
import {
  Input,
  useApiSourcesExportRetrieveQuery,
} from "services/api/generated/api.generated";

const URI_STATIC_VALUE_PREFIX = "http://terminology.arkhn.org/";

type StaticInputProps = {
  input: Input;
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
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();
  const classes = useStyles();
  const [staticValue, setStaticValue] = useState(input.static_value ?? "");
  const [deleteInput] = useApiInputsDestroyMutation();
  const [updateInput] = useApiInputsUpdateMutation();
  const { data: mappings } = useApiSourcesExportRetrieveQuery(
    { id: sourceId ?? "" },
    { skip: !sourceId }
  );
  const currentMapping = useMemo(
    () =>
      mappings?.resources?.find(
        // TODO : Fix Resource type by adding it {id: string} in river-schema.yml
        (resource) => resource.id === mappingId
      ),
    [mappings, mappingId]
  );
  const selectedNode = useGetSelectedNode();
  const isNodeTypeURI = selectedNode?.type === "uri";
  const isNodeNameType = selectedNode?.name === "type";
  const handleDeleteInput = async () => {
    try {
      await deleteInput({ id: input.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStaticValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setStaticValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (staticValue !== input.static_value) {
      try {
        await updateInput({
          id: input.id,
          inputRequest: { ...input, static_value: staticValue },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleGenerateURIClick = async () => {
    if (currentMapping) {
      const staticValue = `${URI_STATIC_VALUE_PREFIX}${currentMapping.logical_reference}`;
      try {
        await updateInput({
          id: input.id,
          inputRequest: { ...input, static_value: staticValue },
        });
        setStaticValue(staticValue);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Grid container item alignItems="center" direction="row" spacing={1}>
      {isNodeTypeURI && isNodeNameType ? (
        <></>
      ) : (
        <>
          <Grid item container alignItems="center" xs={10} spacing={2}>
            <Grid item xs={7}>
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
            </Grid>
            {isNodeTypeURI && (
              <Grid item>
                <Button variant="outlined" onClick={handleGenerateURIClick}>
                  {t("generateURI")}
                </Button>
              </Grid>
            )}
          </Grid>
        </>
      )}

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
