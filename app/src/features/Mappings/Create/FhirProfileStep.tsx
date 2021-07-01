import React, { useEffect, useState } from "react";

import { IStructureDefinition } from "@ahryman40k/ts-fhir-types/lib/R4";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import {
  useApiStructureDefinitionListQuery,
  useApiStructureDefinitionRetrieveQuery,
} from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

import { resourceUpdated } from "../resourceSlice";
import UploadProfileListItem from "./UploadProfileListItem";

const useStyles = makeStyles((theme) => ({
  listItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 5,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
    marginBlock: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  icon: {
    color: theme.palette.text.primary,
    fill: theme.palette.text.primary,
    marginRight: theme.spacing(1),
  },
  divider: {
    maxWidth: 200,
    flexGrow: 1,
    marginBlock: theme.spacing(2),
  },
  divideContainer: {
    display: "flex",
    justifyContent: "center",
  },
  flameIcon: {
    fill: theme.palette.icons.orange.main,
    margin: 0,
  },
}));

type FhirProfileStepProps = {
  mapping: Partial<Resource>;
};

const FhirProfileStep = ({ mapping }: FhirProfileStepProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [
    originalStructureDefinition,
    setOriginalStructureDefinition,
  ] = useState<IStructureDefinition | undefined>(undefined);

  const {
    data: selectedStructureDefinition,
  } = useApiStructureDefinitionRetrieveQuery(
    {
      id: mapping.definition_id ?? "",
    },
    { skip: !mapping.definition_id }
  );
  const {
    data: profiles,
    isFetching: isProfilesFetching,
  } = useApiStructureDefinitionListQuery(
    {
      params: `type=${originalStructureDefinition?.id}&derivation=constraint`,
    },
    { skip: !originalStructureDefinition?.id }
  );

  useEffect(() => {
    if (
      selectedStructureDefinition &&
      selectedStructureDefinition.derivation === "specialization"
    ) {
      setOriginalStructureDefinition(selectedStructureDefinition);
    }
  }, [selectedStructureDefinition]);

  const isProfileSelected = (id?: string) => mapping.definition_id === id;
  const handleProfileClick = (definitionId?: string) => () => {
    if (mapping.id)
      dispatch(
        resourceUpdated({
          id: mapping.id,
          changes: { definition_id: definitionId },
        })
      );
  };

  return (
    <Container maxWidth="md">
      <Typography align="center">
        {t("selectFhirProfilePrompt")}{" "}
        <b>
          <Icon
            icon={IconNames.FLAME}
            className={clsx(classes.icon, classes.flameIcon)}
            iconSize={12}
          />
          {` ${selectedStructureDefinition?.type} `}
        </b>
        {t("resource")}
      </Typography>
      <UploadProfileListItem
        mapping={mapping}
        originalStructureDefinition={originalStructureDefinition}
      />
      <div className={classes.divideContainer}>
        <Divider className={classes.divider} />
      </div>
      <List>
        <ListItem
          button
          alignItems="flex-start"
          className={classes.listItem}
          onClick={handleProfileClick(originalStructureDefinition?.id)}
        >
          <ListItemIcon>
            <Icon
              icon={IconNames.CUBE}
              className={clsx(classes.icon)}
              iconSize={20}
            />
          </ListItemIcon>
          <ListItemText primary={t("defaultProfile")} />
          {isProfileSelected(originalStructureDefinition?.id) && (
            <CheckIcon color="primary" />
          )}
        </ListItem>
        {isProfilesFetching ? (
          <CircularProgress />
        ) : (
          profiles &&
          profiles.map(({ id, title, name }) => (
            <ListItem
              button
              key={id}
              alignItems="flex-start"
              className={classes.listItem}
              onClick={handleProfileClick(id)}
            >
              <ListItemIcon>
                <Icon
                  icon={IconNames.CUBE}
                  className={clsx(classes.icon)}
                  iconSize={20}
                />
              </ListItemIcon>
              <ListItemText primary={title || name} />
              {isProfileSelected(id) && <CheckIcon color="primary" />}
            </ListItem>
          ))
        )}
      </List>
    </Container>
  );
};

export default FhirProfileStep;
