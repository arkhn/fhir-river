import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, Container } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import Button from "common/components/Button";
import Navbar from "features/Navbar/Navbar";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: `0px 5px 5px ${theme.palette.divider}`,
    justifyContent: "space-between",
  },
}));

const MappingHeader = (): JSX.Element => {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();

  const handlePreviewClick = () => {
    history.push(`${location.pathname}/preview`);
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="xl">
        <Navbar>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon icon={IconNames.PLAY} />}
            onClick={handlePreviewClick}
          >
            {t("preview")}
          </Button>
        </Navbar>
      </Container>
    </div>
  );
};

export default MappingHeader;
