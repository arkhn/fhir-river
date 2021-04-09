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
    <Drawer open={isDrawerOpen} onClose={handleDrawerClose} anchor="right">
      {editType === EditTypeEnum.Source && <SourceForm />}
      {editType === EditTypeEnum.Credential && source && (
        <CredentialForm source={source} />
      )}
      {editType === EditTypeEnum.Owners && credential && (
        <>
          <CredentialOwnersSelect credential={credential} />
          <Button
            className={classes.button}
            type="submit"
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
