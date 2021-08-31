import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { makeStyles, Typography } from "@material-ui/core";
import { ArrowForward } from "@material-ui/icons";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import {
  useApiFiltersListQuery,
  useApiStructureDefinitionRetrieveQuery,
} from "services/api/endpoints";
import { Resource } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    width: theme.mixins.icons.size,
    height: theme.mixins.icons.size,
  },
  flameIcon: {
    fill: theme.palette.orange.main,
    marginRight: theme.spacing(0),
  },
  tableIcon: {
    fill: theme.palette.icons.table.main,
    marginRight: theme.spacing(0.5),
  },
  text: {
    margin: theme.spacing(0.5),
  },
  definitionId: {
    fontWeight: 500,
  },
  inlineSpace: {
    marginInline: theme.spacing(1),
  },
}));

type MappingInfosProps = {
  mapping: Resource;
};

const MappingInfos = ({ mapping }: MappingInfosProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { data: filters } = useApiFiltersListQuery({ resource: mapping.id });

  const { title } = useApiStructureDefinitionRetrieveQuery(
    {
      id: mapping.definition_id,
    },
    {
      selectFromResult: ({ data }) => ({
        title: data?.title || data?.name || mapping.definition_id,
      }),
    }
  );

  const filtersCount = filters?.length ?? 0;

  return (
    <div className={classes.root}>
      <Icon
        icon={IconNames.TH}
        className={clsx(classes.icon, classes.tableIcon)}
      />
      <Typography className={classes.text} color="textPrimary">
        {mapping.primary_key_table}
        {filtersCount > 0 &&
          ` + ${t(`filterWithCount`, { count: filtersCount })}`}
      </Typography>
      <ArrowForward className={clsx(classes.icon, classes.inlineSpace)} />
      <Icon
        icon={IconNames.FLAME}
        className={clsx(classes.icon, classes.flameIcon)}
      />
      <Typography
        className={clsx(classes.text, classes.definitionId)}
        color="textPrimary"
      >
        {title}
      </Typography>
      <Typography
        className={classes.text}
        color="textSecondary"
      >{`·`}</Typography>
      <Typography className={classes.text} color="textSecondary">
        {mapping.label}
      </Typography>
    </div>
  );
};

export default MappingInfos;
