import React from "react";

import {
  Breadcrumbs,
  LinkProps,
  Link as MuiLink,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";

import { useRetrieveSourceQuery } from "services/api/api";

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const Link = (props: LinkRouterProps) => (
  <MuiLink {...props} component={RouterLink} />
);

const useStyles = makeStyles((theme) => ({
  separator: {
    fontSize: theme.typography.h5.fontSize,
  },
  mainCrumb: {
    fontWeight: 500,
  },
}));

const NavigationBreadcrumbs = (): JSX.Element => {
  const { t } = useTranslation();
  const { sourceId } = useParams<{ sourceId?: string }>();

  const { data: source } = useRetrieveSourceQuery({
    id: sourceId ?? "",
  });

  const classes = useStyles();
  return (
    <Breadcrumbs separator=">" classes={{ separator: classes.separator }}>
      <Link variant="h5" color="textSecondary" to="/">
        {t("sources")}
      </Link>
      {source && (
        <Link
          className={classes.mainCrumb}
          variant="h5"
          color="textPrimary"
          to={`/source/${source.id}`}
        >
          {source.name}
        </Link>
      )}
    </Breadcrumbs>
  );
};

export default NavigationBreadcrumbs;
