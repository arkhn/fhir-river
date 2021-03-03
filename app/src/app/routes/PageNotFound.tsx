import React from "react";

import { Container, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const PageNotFound = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Container maxWidth="xl">
      <Typography variant="h5">{t("pageNotFound")}</Typography>
    </Container>
  );
};

export default PageNotFound;
