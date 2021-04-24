import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import CheckIcon from "@material-ui/icons/Check";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  listItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 5,
    boxShadow: `0 1px 5px ${theme.palette.divider}`,
    marginBlock: theme.spacing(6),
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
  },
  divideContainer: {
    display: "flex",
    justifyContent: "center",
  },
  flameIcon: {
    fill: "#CC7831",
    margin: 0,
  },
}));

type FhirProfileStepProps = {
  mapping: Partial<Resource>;
};

const FhirProfileStep = ({ mapping }: FhirProfileStepProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isDefaultProfileSelected, setDefaultProfileSelected] = useState(false);

  const handleClickDefaultProfile = () => {
    setDefaultProfileSelected(true);
    // TODO: update
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
          {` ${mapping.definition_id} `}
        </b>
        {t("resource")}
      </Typography>
      <ListItem
        button
        alignItems="flex-start"
        className={classes.listItem}
        onClick={handleClickDefaultProfile}
      >
        <ListItemIcon>
          <Icon
            icon={IconNames.CUBE}
            className={clsx(classes.icon)}
            iconSize={20}
          />
        </ListItemIcon>
        <ListItemText primary={t("defaultProfile")} />
        {isDefaultProfileSelected && <CheckIcon color="primary" />}
      </ListItem>
      <div className={classes.divideContainer}>
        <Divider className={classes.divider} />
      </div>
      <ListItem button className={classes.listItem}>
        <ListItemIcon>
          <AddIcon className={classes.icon} />
        </ListItemIcon>
        <ListItemText primary={t("importNewProfile")} />
      </ListItem>
    </Container>
  );
};

export default FhirProfileStep;
