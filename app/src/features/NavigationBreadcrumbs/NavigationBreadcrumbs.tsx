import React from "react";

import {
  Breadcrumbs,
  LinkProps,
  Link as MuiLink,
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useHistory, useParams } from "react-router-dom";

import {
  useApiSourcesRetrieveQuery,
  useApiResourcesRetrieveQuery,
} from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

import MappingSelectButton from "./MappingSelectButton";

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
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { sourceId, mappingId } = useParams<{
    sourceId?: string;
    mappingId?: string;
  }>();

  const { data: source } = useApiSourcesRetrieveQuery(
    {
      id: sourceId ?? "",
    },
    { skip: !sourceId }
  );
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );

  const handleMappingChange = (newMapping: Resource) => {
    history.push(`/sources/${sourceId}/mappings/${newMapping.id}`);
  };

  return (
    <Breadcrumbs separator=">" classes={{ separator: classes.separator }}>
      <Link variant="h5" color="textSecondary" to="/">
        {t("sources")}
      </Link>
      {source && (
        <Link
          className={clsx({ [classes.mainCrumb]: source && !mapping })}
          variant="h5"
          color={mapping ? "textSecondary" : "textPrimary"}
          to={`/sources/${source.id}`}
        >
          {source.name}
        </Link>
      )}
      {source && mapping && (
        <MappingSelectButton
          mapping={mapping}
          source={source}
          onChange={handleMappingChange}
        />
      )}
    </Breadcrumbs>
  );
};

export default NavigationBreadcrumbs;
