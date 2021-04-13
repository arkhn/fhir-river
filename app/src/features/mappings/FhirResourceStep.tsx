import React, { useState } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Container,
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

import { Resource } from "services/api/generated/api.generated";

//Mock
const FhirResources = [
  "Account",
  "ActivityDefinition",
  "AdverseEvent",
  "AllergyIntolerance",
  "Appointment",
];

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
    fill: "#CC7831",
  },
}));

type FhirResourceStepProps = {
  mapping: Partial<Resource>;
  onChange?: (mapping: Partial<Resource>) => void;
};

const FhirResourceStep = ({
  mapping,
  onChange,
}: FhirResourceStepProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState("");

  const isDefIdSelected = (defId: string) => defId === mapping.definition_id;
  const handleClickFhirResource = (defId: string) => () => {
    onChange && onChange({ definition_id: defId });
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
      <List>
        {FhirResources.filter((defId) =>
          defId.toLowerCase().includes(searchValue.toLowerCase())
        ).map((defId) => (
          <ListItem
            button
            key={defId}
            alignItems="flex-start"
            className={classes.listItem}
            onClick={handleClickFhirResource(defId)}
          >
            <ListItemIcon>
              <Icon
                icon={IconNames.FLAME}
                className={clsx(classes.icon, classes.flameIcon)}
                iconSize={20}
              />
            </ListItemIcon>
            <ListItemText primary={defId} />
            {isDefIdSelected(defId) && <CheckIcon color="primary" />}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default FhirResourceStep;
