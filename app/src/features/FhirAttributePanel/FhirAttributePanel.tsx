import React from "react";

import {
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import AttributeInputGroup from "features/FhirAttributePanel/AttributeInputGroup";
import {
  useApiAttributesRetrieveQuery,
  useApiInputGroupsListQuery,
  useApiInputGroupsCreateMutation,
} from "services/api/endpoints";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
    marginTop: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(4),
  },
}));

const FhirAttributePanel = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { attributeId } = useParams<{ attributeId?: string }>();
  const {
    data: attribute,
    isError,
    isUninitialized,
    isFetching,
  } = useApiAttributesRetrieveQuery(
    { id: attributeId ?? "" },
    { skip: !attributeId }
  );
  const { data: attributeInputGroups } = useApiInputGroupsListQuery(
    { attribute: attribute?.id ?? "" },
    { skip: !attribute }
  );
  const [createInputGroup] = useApiInputGroupsCreateMutation();

  const handleCreateInputGroup = async () => {
    if (attribute) {
      try {
        await createInputGroup({
          inputGroupRequest: {
            attribute: attribute.id,
          },
        });
      } catch (error) {
        //
      }
    }
  };

  if (isFetching) {
    return <CircularProgress />;
  }

  return (
    <>
      {!isError && !isUninitialized && (
        <div className={classes.container}>
          <Grid container spacing={4} direction="column">
            {attributeInputGroups &&
              attributeInputGroups.map((inputGroup, index) => (
                <AttributeInputGroup
                  key={inputGroup.id}
                  inputGroup={inputGroup}
                  requireCondition={index > 0}
                />
              ))}
          </Grid>
          {attribute && (
            <Button
              size="small"
              variant="outlined"
              className={classes.button}
              startIcon={<Add />}
              onClick={handleCreateInputGroup}
            >
              <Typography>{t("addGroup")}</Typography>
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default FhirAttributePanel;
