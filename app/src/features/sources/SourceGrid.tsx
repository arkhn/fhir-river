import React from "react";

import { CircularProgress, Grid, makeStyles } from "@material-ui/core";
import SourceCard from "./SourceCard";

import { useListSourcesQuery } from "services/api/api";
import {
  Source,
  useListAttributesQuery,
  useListResourcesQuery,
} from "services/api/generated/api.generated";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    flexGrow: 1,
    paddingBlock: theme.spacing(3),
  },
}));

type SourceGridProps = {
  editSource: (source: Source) => void;
};

const SourceGrid = ({ editSource }: SourceGridProps) => {
  const classes = useStyles();
  const { isLoading, data } = useListSourcesQuery({});
  const resourcesQuery = useListResourcesQuery({});
  const attributesQuery = useListAttributesQuery({});

  const _getResourceAndAttributeCounts = (source: Source) => {
    const sourceResources = resourcesQuery.data
      ? resourcesQuery.data.filter((resource) => resource.source === source.id)
      : [];

    const attributeCount = sourceResources.reduce((count, resource) => {
      const resourceAttributes = attributesQuery.data
        ? attributesQuery.data.map(
            (attribute) => attribute.resource === resource.id
          )
        : [];
      return count + resourceAttributes.length;
    }, 0);

    return { attributeCount, resourceCount: sourceResources.length };
  };

  return (
    <Grid className={classes.gridContainer} container spacing={3}>
      {isLoading || !data ? (
        <CircularProgress />
      ) : (
        data.map((source) => {
          const {
            attributeCount,
            resourceCount,
          } = _getResourceAndAttributeCounts(source);

          return (
            <Grid item key={source.id}>
              <SourceCard
                source={source}
                mappingCount={resourceCount}
                attributesCount={attributeCount}
                editSource={editSource}
              />
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default SourceGrid;
