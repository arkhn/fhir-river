import React from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { CardContent, CircularProgress, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import CardContentItem from "common/components/CardContentItem";
import { useApiResourcesListQuery } from "services/api/endpoints";
import type { Source } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
    "& path": {
      fill: theme.palette.text.secondary,
    },
  },
}));

type SourceCardInfoProps = {
  source: Source;
};

const SourceCardInfo = ({ source }: SourceCardInfoProps): JSX.Element => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    data: mappings,
    isLoading: isMappingsLoading,
  } = useApiResourcesListQuery({ source: source.id });

  const isSourceInfoLoading = isMappingsLoading;

  const mappingsCount = mappings?.length;

  return (
    <CardContent>
      {isSourceInfoLoading ? (
        <CircularProgress />
      ) : (
        <>
          {undefined !== mappingsCount && (
            <CardContentItem
              label={t("mappingCount", { count: mappingsCount })}
              startAdornment={
                <Icon
                  icon={IconNames.DIAGRAM_TREE}
                  className={classes.icon}
                  iconSize={12}
                />
              }
            />
          )}
        </>
      )}
    </CardContent>
  );
};

export default SourceCardInfo;
