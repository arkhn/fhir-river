import React from "react";

import {
  Breadcrumbs,
  LinkProps,
  Link as MuiLink,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

import { Source } from "services/api/generated/api.generated";

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const Link = (props: LinkRouterProps) => (
  <MuiLink {...props} component={RouterLink} />
);

type SourceBreadcrumbsProps = {
  source: Source;
};

const useStyles = makeStyles((theme) => ({
  separator: {
    fontSize: theme.typography.h5.fontSize,
  },
  mainCrumb: {
    fontWeight: 500,
  },
}));

const SourceBreadcrumbs = ({ source }: SourceBreadcrumbsProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Breadcrumbs separator=">" classes={{ separator: classes.separator }}>
      <Link variant="h5" color="textSecondary" to="/">
        {t("sources")}
      </Link>
      <Link
        className={classes.mainCrumb}
        variant="h5"
        color="textPrimary"
        to={`/source/${source.id}`}
      >
        {source.name}
      </Link>
    </Breadcrumbs>
  );
};

export default SourceBreadcrumbs;
