import React from "react";

import { Drawer, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import Button from "common/components/Button";

import CredentialForm from "./CredentialForm";
import CredentialOwnersSelect from "./CredentialOwnersSelect";
import ProjectForm from "./ProjectForm";
import {
  selectProjectCurrent,
  selectEditType,
  selectProjectCredential,
  EditTypeEnum,
  initProject,
} from "./projectSlice";

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(3),
    width: "fit-content",
    minWidth: 150,
  },
  title: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    fontWeight: "bold",
  },
  drawer: {
    minWidth: 400,
  },
}));

const ProjectDrawer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const project = useAppSelector(selectProjectCurrent);
  const credential = useAppSelector(selectProjectCredential);
  const editType = useAppSelector(selectEditType);

  const isDrawerOpen = Boolean(editType);
  const handleDrawerClose = () => dispatch(initProject());

  return (
    <Drawer
      PaperProps={{ className: classes.drawer }}
      open={isDrawerOpen}
      onClose={handleDrawerClose}
      anchor="right"
    >
      {editType === EditTypeEnum.Project && <ProjectForm />}
      {editType === EditTypeEnum.Credential && project && (
        <CredentialForm project={project} />
      )}
      {editType === EditTypeEnum.Owners && credential && (
        <>
          <Typography className={classes.title} variant="h5">
            {t("selectOwners")}
          </Typography>
          <CredentialOwnersSelect credential={credential} />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            fullWidth={false}
            onClick={handleDrawerClose}
          >
            {t("done")}
          </Button>
        </>
      )}
    </Drawer>
  );
};

export default ProjectDrawer;
