import React, { useState } from "react";

import { Button, ButtonProps, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import Alert from "common/components/Alert";
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

  const [alert, setAlert] = useState<string | undefined>(undefined);
  const handleAlertClose = () => setAlert(undefined);

  const [apiBatchesDestroy] = useApiBatchesDestroyMutation();

  const handleBatchCancel = (batchId: string) => async () => {
    try {
      await apiBatchesDestroy({ id: batchId }).unwrap();
    } catch (e) {
      setAlert(e.message as string);
    }
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={(e) => {
          e.stopPropagation();
          handleBatchCancel(batch.id);
        }}
      >
        <Typography>{t("cancel")}</Typography>
      </Button>
      <Alert
        severity="error"
        open={!!alert}
        onClose={handleAlertClose}
        message={alert}
      />
    </>
  );
};

export default BatchCancel;
