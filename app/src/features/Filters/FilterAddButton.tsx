import React from "react";

import { Button, ButtonProps, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch } from "app/store";
import { columnAdded } from "features/Columns/columnSlice";
import { Resource } from "services/api/generated/api.generated";

import { filterAdded } from "./filterSlice";

type FilterAddProps = { mapping: Partial<Resource> } & ButtonProps;

const FilterAddButton = ({
  mapping,
  ...props
}: FilterAddProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleFilterAdd = () => {
    const columnId = uuid();
    dispatch(columnAdded({ id: columnId }));
    dispatch(
      filterAdded({
        id: uuid(),
        resource: mapping.id,
        sql_column: columnId,
      })
    );
  };

  return (
    <Button {...props} onClick={handleFilterAdd}>
      <Typography>{t("addFilter")}</Typography>
    </Button>
  );
};

export default FilterAddButton;
