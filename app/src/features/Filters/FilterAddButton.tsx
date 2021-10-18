import React from "react";

import { ButtonProps } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";

import { useAppDispatch } from "app/store";
import Button from "common/components/Button";
import { columnAdded } from "features/Columns/columnSlice";
import { sqlInputAdded } from "features/Inputs/sqlInputSlice";
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
    const sqlInputId = uuid();
    dispatch(columnAdded({ id: columnId }));
    dispatch(sqlInputAdded({ id: sqlInputId, column: columnId }));
    dispatch(
      filterAdded({
        id: uuid(),
        resource: mapping.id,
        sql_input: sqlInputId,
      })
    );
  };

  return (
    <Button {...props} onClick={handleFilterAdd}>
      {t("addFilter")}
    </Button>
  );
};

export default FilterAddButton;
