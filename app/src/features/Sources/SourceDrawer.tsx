import React from "react";

import { Button, Drawer, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";

import CredentialForm from "./CredentialForm";
import CredentialOwnersSelect from "./CredentialOwnersSelect";
import SourceForm from "./SourceForm";
import {
  selectSourceCurrent,
  selectEditType,
  selectSourceCredential,
  EditTypeEnum,
  initSource,
} from "./sourceSlice";

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(3),
    textTransform: "none",
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

const SourceDrawer = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const source = useAppSelector(selectSourceCurrent);
  const credential = useAppSelector(selectSourceCredential);
  const editType = useAppSelector(selectEditType);

  const isDrawerOpen = Boolean(editType);
  const handleDrawerClose = () => dispatch(initSource());

  return (
    <Drawer
      PaperProps={{ className: classes.drawer }}
      open={isDrawerOpen}
      onClose={handleDrawerClose}
      anchor="right"
    >
      {editType === EditTypeEnum.Source && <SourceForm />}
      {editType === EditTypeEnum.Credential && source && (
        <CredentialForm source={source} />
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
            <Typography>{t("done")}</Typography>
          </Button>
        </>
      )}
    </Drawer>
  );
};

export default SourceDrawer;
