import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import {
  Breadcrumbs,
  LinkProps,
  Link as MuiLink,
  makeStyles,
  BreadcrumbsProps as MuiBreadcrumbsProps,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";

import {
  useApiSourcesRetrieveQuery,
  useApiResourcesRetrieveQuery,
} from "services/api/endpoints";

import EditMappingButton from "./EditMappingButton";
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
  breadcrumbsContainer: {
    display: "flex",
    padding: `${theme.spacing(4)}px ${theme.spacing(5)}px`,
    minHeight: theme.mixins.breadcrumbBar.height,
    alignItems: "center",
    flexWrap: "wrap",
  },
  children: { marginLeft: "auto" },
  delete: {
    color: theme.palette.error.light,
  },
  actionButton: {
    boxShadow: `0px 0px 10px ${theme.palette.divider}`,
    marginRight: theme.spacing(1),
    paddingInline: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 5,
    height: 40,
  },
}));

const Navbar = ({ ...props }: MuiBreadcrumbsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
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
  const isEtl = location.pathname.endsWith("batches");
  const isSource = sourceId && location.pathname.endsWith(sourceId);

  return (
    <div className={classes.breadcrumbsContainer}>
      <Breadcrumbs
        {...props}
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
            {t("ETLDashboard")}
          </Link>
        )}
        {source && mapping && (
          <div>
            <MappingSelectButton mapping={mapping} source={source} />
            <EditMappingButton />
          </div>
        )}
      </Breadcrumbs>
      <div className={classes.children}>{props.children}</div>
    </div>
  );
};

export default Navbar;