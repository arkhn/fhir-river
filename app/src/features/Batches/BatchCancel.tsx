import React from "react";

import { Button, ButtonProps, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { useApiBatchesDestroyMutation } from "services/api/endpoints";

import type { Batch } from "../../services/api/generated/api.generated";

type BatchCancelProps = {
  batch: Batch;
} & ButtonProps;

const BatchCancel = ({
  batch,
  ...buttonProps
}: BatchCancelProps): JSX.Element => {
  const { t } = useTranslation();

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => async () => {
    try {
      await apiBatchesDestroy({ id: batchId }).unwrap();
    } catch (e) {}
  };

  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        e.stopPropagation();
        handleBatchCancel(batch.id);
      }}
    >
      <Typography>{t("cancel")}</Typography>
    </Button>
  );
};

export default BatchCancel;
