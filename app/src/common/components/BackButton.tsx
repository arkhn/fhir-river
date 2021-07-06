import React from "react";

import { Button, ButtonProps, Typography } from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

type BackButtonProps = ButtonProps;

const BackButton = ({ ...buttonProps }: BackButtonProps): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleBackClick = () => {
    history.goBack();
  };

  return (
    <Button
      {...buttonProps}
      startIcon={<ArrowBack />}
      onClick={handleBackClick}
      disableRipple
    >
      <Typography>{t("back")}</Typography>
    </Button>
  );
};

export default BackButton;
