import React, { useEffect } from "react";

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

import { useAppDispatch } from "app/store";
import AttributeInputGroup from "features/FhirAttributePanel/AttributeInputGroup";
import { resourceAdded } from "features/Mappings/resourceSlice";
import {
  useApiAttributesRetrieveQuery,
  useApiInputGroupsListQuery,
  useApiInputGroupsCreateMutation,
  useApiResourcesRetrieveQuery,
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
  const dispatch = useAppDispatch();
  const { attributeId, mappingId } = useParams<{
    attributeId?: string;
    mappingId?: string;
  }>();
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
  const { data: mapping } = useApiResourcesRetrieveQuery(
    { id: mappingId ?? "" },
    { skip: !mappingId }
  );

  useEffect(() => {
    if (mapping) dispatch(resourceAdded(mapping));
  }, [dispatch, mapping]);

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
              attributeInputGroups.map((inputGroup) => (
                <AttributeInputGroup
                  key={inputGroup.id}
                  inputGroup={inputGroup}
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
