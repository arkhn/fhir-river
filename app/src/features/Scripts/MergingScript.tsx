import React from "react";

import { Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useTranslation } from "react-i18next";

import AutocompletePopper from "common/components/AutocompletePopper";
import { useApiInputGroupsUpdateMutation } from "services/api/endpoints";
import {
  InputGroup,
  useApiScriptsListQuery,
} from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  badgeLabel: {
    backgroundColor: theme.palette.divider,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
  },
  autocomplete: {
    minWidth: 200,
    color: theme.palette.text.disabled,
    cursor: "pointer",
  },
  mergingScript: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  mergingScriptName: {
    marginRight: theme.spacing(1),
  },
}));

type MergingScriptProps = {
  inputGroup: InputGroup;
};

const MergingScript = ({ inputGroup }: MergingScriptProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [updateInputGroup] = useApiInputGroupsUpdateMutation();
  const { data: mergingScripts } = useApiScriptsListQuery();

  const handleMergingScriptSelect = async (
    event: React.ChangeEvent<Record<string, never>>,
    selectedScript: string | null
  ) => {
    if (selectedScript && selectedScript !== inputGroup.merging_script) {
      await updateInputGroup({
        id: inputGroup.id,
        inputGroupRequest: { ...inputGroup, merging_script: selectedScript },
      });
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
        {mergingScripts && (
          <Autocomplete
            PopperComponent={AutocompletePopper}
            openOnFocus
            options={mergingScripts.map((mergingScript) => mergingScript.name)}
            fullWidth
            disableClearable
            onChange={handleMergingScriptSelect}
            classes={{ root: classes.autocomplete }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t("selectScript")}
                variant="outlined"
                size="small"
                margin="dense"
              />
            )}
            value={inputGroup.merging_script}
            renderOption={(searchValue) => {
              const searchResults = mergingScripts.find(
                (mergingScript) => mergingScript.name === searchValue
              );
              if (searchResults)
                return (
                  <div className={classes.mergingScript}>
                    <Typography className={classes.mergingScriptName}>
                      {searchResults.name}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      noWrap
                      variant="subtitle2"
                    >
                      {searchResults.description}
                    </Typography>
                  </div>
                );
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default MergingScript;
