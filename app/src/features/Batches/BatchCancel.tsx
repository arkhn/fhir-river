import React from "react";

import { ButtonProps } from "@material-ui/core";
import { CancelOutlined } from "@material-ui/icons";
import { useSnackbar } from "notistack";
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
  const { enqueueSnackbar } = useSnackbar();

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    try {
      await apiBatchesDestroy({ id: batchId }).unwrap();
    } catch (e) {
      enqueueSnackbar(e.message as string, { variant: "error" });
    }
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
