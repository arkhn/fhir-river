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
  useApiProjectsRetrieveQuery,
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

const Navbar = (props: MuiBreadcrumbsProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { projectId, mappingId } = useParams<{
    projectId?: string;
    mappingId?: string;
  }>();
  const location = useLocation();

  const { data: project } = useApiProjectsRetrieveQuery(
    {
      id: projectId ?? "",
    },
    { skip: !projectId }
  );
  const { data: mapping } = useApiResourcesRetrieveQuery(
    {
      id: mappingId ?? "",
    },
    { skip: !mappingId }
  );
  const isEtl = location.pathname.endsWith("batches");
  const isSource = projectId && location.pathname.endsWith(projectId);

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
          {t("projects")}
        </Link>
        {project && (
          <Link
            className={clsx(classes.breadCrumbLinks, {
              [classes.mainCrumb]: project && !mapping && !isEtl,
            })}
            variant="h5"
            color={!isSource ? "textSecondary" : "textPrimary"}
            to={`/projects/${project.id}`}
          >
            {project.name}
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
        {project && mapping && (
          <div>
            <MappingSelectButton mapping={mapping} project={project} />
            <EditMappingButton />
          </div>
        )}
      </Breadcrumbs>
      <div className={classes.children}>{props.children}</div>
    </div>
  );
};

export default Navbar;
