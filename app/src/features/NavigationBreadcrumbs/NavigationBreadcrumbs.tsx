import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Breadcrumbs,
  LinkProps,
  Link as MuiLink,
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Link as RouterLink,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";

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
    fill: theme.palette.text.secondary,
  },
  mainCrumb: {
    fontWeight: 500,
  },
  breadCrumbLinks: {
    fontSize: "1.2rem",
    "&:hover": {
      textDecoration: "none",
      opacity: "0.6",
    },
  },
  icons: {
    height: 12,
    marginBottom: "-2px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  const location = useLocation();

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
  const isEtl = location.pathname.endsWith("batches");
  const isSource = sourceId && location.pathname.endsWith(sourceId);

  return (
    <Breadcrumbs
      separator={
        <Icon
          iconSize={14}
          icon={IconNames.CHEVRON_RIGHT}
          className={classes.icons}
        />
      }
      classes={{ separator: classes.separator }}
    >
      <Link
        variant="h5"
        color="textSecondary"
        to="/"
        className={classes.breadCrumbLinks}
      >
        {t("sources")}
      </Link>
      {source && (
        <Link
          className={clsx(classes.breadCrumbLinks, {
            [classes.mainCrumb]: source && !mapping && !isEtl,
          })}
          variant="h5"
          color={!isSource ? "textSecondary" : "textPrimary"}
          to={`/sources/${source.id}`}
        >
          {source.name}
        </Link>
      )}
      {isEtl && (
        <Link
          className={clsx(classes.breadCrumbLinks, {
            [classes.mainCrumb]: isEtl,
          })}
          variant="h5"
          color={!isEtl ? "textSecondary" : "textPrimary"}
          to={location.pathname}
        >
          ETL
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
