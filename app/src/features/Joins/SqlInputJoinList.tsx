import React, { useState, useEffect, useCallback } from "react";

import { Button, Grid, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import { useTranslation } from "react-i18next";

import Join from "features/Joins/Join";
import {
  useApiJoinsListQuery,
  useApiJoinsDestroyMutation,
} from "services/api/endpoints";
import {
  SqlInput,
  Join as JoinType,
} from "services/api/generated/api.generated";

type SqlInputJoinListProps = {
  sqlInputId: SqlInput["id"];
};

const SqlInputJoinList = ({
  sqlInputId,
}: SqlInputJoinListProps): JSX.Element => {
  const { t } = useTranslation();

  const [inputJoins, setInputJoins] = useState<Partial<JoinType>[]>([]);
  const [deleteJoin] = useApiJoinsDestroyMutation();

  const { data: apiInputJoins, isSuccess } = useApiJoinsListQuery(
    { sqlInput: sqlInputId ?? "" },
    { skip: !sqlInputId }
  );

  // After joins have been fetched from the api, we update the list of joins
  useEffect(() => {
    if (apiInputJoins) setInputJoins([...apiInputJoins]);
  }, [apiInputJoins]);

  const handleJoinAdd = useCallback(() => {
    if (sqlInputId) {
      const newJoin = { sql_input: sqlInputId };
      setInputJoins([...inputJoins, newJoin]);
    }
  }, [inputJoins, sqlInputId]);

  const handleJoinDelete = (index: number) => () => {
    const joinToDelete = inputJoins[index];
    if (joinToDelete?.id) {
      deleteJoin({ id: joinToDelete.id });
    } else {
      setInputJoins(inputJoins.filter((_, _index) => _index !== index));
    }
  };

  // Creates a join if join list is loaded and empty
  useEffect(() => {
    if (isSuccess && !apiInputJoins?.length && !inputJoins.length) {
      handleJoinAdd();
    }
  }, [apiInputJoins?.length, handleJoinAdd, inputJoins.length, isSuccess]);

  return (
    <Grid container direction="column" spacing={1}>
      {inputJoins.map((join, index) => (
        <Join
          key={`${join.id}_${index}`}
          join={join}
          onDelete={handleJoinDelete(index)}
        />
      ))}
      <Grid item>
        <Button
          startIcon={<AddIcon />}
          onClick={handleJoinAdd}
          variant="outlined"
        >
          <Typography>{t("addJoin")}</Typography>
        </Button>
      </Grid>
    </Grid>
  );
};

export default SqlInputJoinList;
