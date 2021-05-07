import React, { ChangeEvent } from "react";

import {
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "app/store";
import { useApiStructureDefinitionCreateMutation } from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

import { resourceUpdated } from "../resourceSlice";

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
  fileInput: {
    display: "none",
  },
}));

type UploadProfileListItemProps = {
  mapping: Partial<Resource>;
};

const UploadProfileListItem = ({
  mapping,
}: UploadProfileListItemProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [
    createStructureDefinition,
    { isLoading },
  ] = useApiStructureDefinitionCreateMutation();

  let fileReader: FileReader | null = null;

  const handleFileRead = async () => {
    const content = fileReader?.result;
    if (content && mapping.id) {
      const parsedContent = JSON.parse(content as string);
      const isContentStructureDef =
        parsedContent.resourceType === "StructureDefinition";

      if (isContentStructureDef) {
        const createdStructureDef = await createStructureDefinition(
          parsedContent
        ).unwrap();
        dispatch(
          resourceUpdated({
            id: mapping.id,
            changes: { definition_id: createdStructureDef.id },
          })
        );
      }
    }
  };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead;
      fileReader.readAsText(file);
    }
  };

  return (
    <label>
      <input
        className={classes.fileInput}
        disabled={isLoading}
        type="file"
        accept=".json"
        onChange={handleFileChange}
      />
      <ListItem button className={classes.listItem}>
        <ListItemIcon>
          <AddIcon className={classes.icon} />
        </ListItemIcon>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <ListItemText primary={t("importNewProfile")} />
        )}
      </ListItem>
    </label>
  );
};

export default UploadProfileListItem;
