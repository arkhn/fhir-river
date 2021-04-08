import React from "react";

import { CardContent, CircularProgress, makeStyles } from "@material-ui/core";
import AttributeIcon from "@material-ui/icons/LocalOffer";
import { useTranslation } from "react-i18next";

import { ReactComponent as MappingIcon } from "assets/icons/mapping_icon.svg";
import CardContentItem from "common/components/CardContentItem";
import {
  useApiResourcesListQuery,
  useApiAttributesListQuery,
} from "services/api/endpoints";
import type { Source } from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  icon: {
    width: 12,
    height: 12,
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
  const {
    data: attributes,
    isLoading: isAttributesLoading,
  } = useApiAttributesListQuery({ source: source.id });

  const isSourceInfoLoading = isMappingsLoading || isAttributesLoading;

  const attributesCount = attributes?.length;
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
              startAdornment={<MappingIcon className={classes.icon} />}
            />
          )}
          {undefined !== attributesCount && (
            <CardContentItem
              label={t("attributesCount", { count: attributesCount })}
              startAdornment={<AttributeIcon className={classes.icon} />}
            />
          )}
        </>
      )}
    </CardContent>
  );
};

export default SourceCardInfo;
