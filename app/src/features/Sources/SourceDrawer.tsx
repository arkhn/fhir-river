import React from "react";

import { Button, Drawer, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "app/store";
import CredentialForm from "features/Sources/CredentialForm";
import CredentialOwnersSelect from "features/Sources/CredentialOwnersSelect";
import SourceForm from "features/Sources/SourceForm";
import {
  selectSourceCurrent,
  selectIsSourceEditing,
  selectSourceCredential,
  selectIsSourceCredentialEditing,
  selectIsCredentialOwnersEditing,
  initSource,
} from "features/Sources/sourceSlice";

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
  const isSourceEditing = useAppSelector(selectIsSourceEditing);

  const credential = useAppSelector(selectSourceCredential);
  const isSourceCredentialEditing = useAppSelector(
    selectIsSourceCredentialEditing
  );

  const isCredentialOwnersEditing = useAppSelector(
    selectIsCredentialOwnersEditing
  );

  const isDrawerOpen =
    isSourceEditing || isSourceCredentialEditing || isCredentialOwnersEditing;
  const handleDrawerClose = () => dispatch(initSource());

  return (
    <Drawer open={isDrawerOpen} onClose={handleDrawerClose} anchor="right">
      {isSourceEditing && <SourceForm />}
      {isSourceCredentialEditing && source && (
        <CredentialForm source={source} />
      )}
      {isCredentialOwnersEditing && credential && (
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
