import React from "react";

import { ButtonProps } from "@material-ui/core";
import { CancelOutlined } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

import Button from "common/components/Button";
import { useApiBatchesDestroyMutation } from "services/api/endpoints";
import type { Batch } from "services/api/generated/api.generated";

type BatchCancelProps = {
  batch: Batch;
} & ButtonProps;

const BatchCancel = ({
  batch,
  ...buttonProps
}: BatchCancelProps): JSX.Element => {
  const { t } = useTranslation();

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    await apiBatchesDestroy({ id: batchId }).unwrap();
  };

  return (
    <>
      <Button
        {...buttonProps}
        variant="outlined"
        startIcon={<CancelOutlined />}
        onClick={handleBatchCancel(batch.id)}
      >
        {t("cancel")}
      </Button>
    </>
  );
};

export default BatchCancel;
