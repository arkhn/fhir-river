/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { Button, makeStyles, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "app/store";
import { selectSelectedNode } from "features/FhirResourceTree/resourceTreeSlice";
import {
  useApiAttributesListQuery,
  useApiInputGroupsListQuery,
} from "services/api/endpoints";
import { useApiInputGroupsCreateMutation } from "services/api/generated/api.generated";

import AttributeInputGroup from "./AttributeInputGroup";

const useStyles = makeStyles(() => ({
  button: {
    textTransform: "none",
  },
}));

const FhirAttributePanel = (): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();
  const selectedNode = useAppSelector(selectSelectedNode);
  const { data } = useApiAttributesListQuery(
    { path: selectedNode?.path ?? "" },
    { skip: !selectedNode }
  );
  const attribute = data?.[0];
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

  return (
    <>
      {attributeInputGroups &&
        attributeInputGroups.map((inputGroup) => (
          <AttributeInputGroup key={inputGroup.id} inputGroup={inputGroup} />
        ))}
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
    </>
  );
};

export default FhirAttributePanel;
