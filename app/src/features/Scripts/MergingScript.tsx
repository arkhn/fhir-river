import React from "react";

import {
  Grid,
  makeStyles,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import { useApiInputGroupsUpdateMutation } from "services/api/endpoints";
import {
  InputGroup,
  useApiScriptsListQuery,
} from "services/api/generated/api.generated";

import ScriptMenuItem from "./ScriptListItem";

const useStyles = makeStyles((theme) => ({
  badgeLabel: {
    backgroundColor: theme.palette.divider,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
  },
  menuPopup: {
    maxHeight: 300,
  },
  select: {
    minWidth: 200,
    color: theme.palette.text.disabled,
  },
  selected: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
}));

type MergingScriptProps = {
  inputGroup: InputGroup;
};

const MergingScript = ({ inputGroup }: MergingScriptProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [updateInputGroup] = useApiInputGroupsUpdateMutation();
  const { data: scripts } = useApiScriptsListQuery({});

  const handleMergingScriptSelect = async (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const scriptName = event.target.value as string;
    if (scriptName !== inputGroup.merging_script) {
      try {
        await updateInputGroup({
          id: inputGroup.id,
          inputGroupRequest: { ...inputGroup, merging_script: scriptName },
        });
      } catch (error) {
        enqueueSnackbar(error.error, { variant: "error" });
      }
    }
  };

  return (
    <Grid item container alignItems="center" spacing={2}>
      <Grid item>
        <Typography className={classes.badgeLabel}>
          {t("mergingScript")}
        </Typography>
      </Grid>
      <Grid item>
        {scripts && (
          <Select
            className={classes.select}
            value={inputGroup.merging_script}
            onChange={handleMergingScriptSelect}
            variant="outlined"
            input={
              <OutlinedInput
                margin="dense"
                inputProps={{
                  className: clsx({
                    [classes.selected]: inputGroup.merging_script !== "",
                  }),
                }}
              />
            }
            renderValue={(value) =>
              value === "" ? t("selectScript") : (value as string)
            }
            displayEmpty
            MenuProps={{
              anchorOrigin: { horizontal: "left", vertical: "bottom" },
              getContentAnchorEl: null,
              PaperProps: {
                className: classes.menuPopup,
              },
            }}
          >
            <MenuItem disabled value="">
              {t("selectScript")}
            </MenuItem>
            {scripts.map((script, index) => (
              <MenuItem value={script.name} key={`${script.name}-${index}`}>
                <ScriptMenuItem script={script} />
              </MenuItem>
            ))}
          </Select>
        )}
      </Grid>
    </Grid>
  );
};

export default MergingScript;
