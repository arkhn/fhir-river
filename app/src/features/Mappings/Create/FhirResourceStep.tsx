import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
  TextField,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import SearchIcon from "@material-ui/icons/Search";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import {
  useApiStructureDefinitionRetrieveQuery,
  useApiValueSetsRetrieveQuery,
} from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

import { resourceUpdated } from "../resourceSlice";

const useStyles = makeStyles((theme) => ({
  searchBarContainer: {
    paddingInline: theme.spacing(25),
    paddingBlock: theme.spacing(2),
  },
  listItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 5,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  flameIcon: {
    fill: theme.palette.icons.fhir,
  },
}));

type FhirResourceStepProps = {
  mapping: Partial<Resource>;
};

const FhirResourceStep = ({ mapping }: FhirResourceStepProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useApiValueSetsRetrieveQuery({
    id: "resource-types",
  });
  const {
    data: selectedStructureDefinition,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id: mapping.definition_id ?? "",
    },
    { skip: !mapping.definition_id }
  );
  const resourceTypesCodes = data?.expansion?.contains
    ?.map(({ code }) => code || "")
    .sort();

  const isDefinitionIdSelected = (definitionId: string) =>
    definitionId === selectedStructureDefinition?.type;

  const handleClickFhirResource = (definitionId?: string) => () => {
    if (mapping.id)
      dispatch(
        resourceUpdated({
          id: mapping.id,
          changes: { definition_id: definitionId },
        })
      );
  };

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <Typography align="center">{t("selectFhirResourcePrompt")}</Typography>
      <div className={classes.searchBarContainer}>
        <TextField
          variant="outlined"
          margin="dense"
          fullWidth
          placeholder={t("search")}
          value={searchValue}
          onChange={handleChangeSearch}
          InputProps={{
            startAdornment: <SearchIcon className={classes.icon} />,
          }}
        />
      </div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        resourceTypesCodes && (
          <List>
            {resourceTypesCodes
              .filter((code) =>
                code.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((code) => {
                return (
                  <ListItem
                    button
                    key={code}
                    alignItems="flex-start"
                    className={classes.listItem}
                    onClick={handleClickFhirResource(code)}
                  >
                    <ListItemIcon>
                      <Icon
                        icon={IconNames.FLAME}
                        className={clsx(classes.icon, classes.flameIcon)}
                        iconSize={20}
                      />
                    </ListItemIcon>
                    <ListItemText primary={code} />
                    {isDefinitionIdSelected(code) && (
                      <CheckIcon color="primary" />
                    )}
                  </ListItem>
                );
              })}
          </List>
        )
      )}
    </Container>
  );
};

export default FhirResourceStep;
