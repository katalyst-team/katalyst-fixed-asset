/* eslint-disable simple-import-sort/imports */
import { Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";

interface ActionButtonsSectionProps {
  isFormValid: boolean;
  isCreatingStockMovement: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  module?: "inbound" | "outbound";
}

export function ActionButtonsSection({
  isFormValid,
  isCreatingStockMovement,
  onCancel,
  onSubmit,
  module = "inbound",
}: ActionButtonsSectionProps) {
  const { t } = useTranslation([module]);
  const router = useRouter();
  
  const handleCancel = useCallback(() => {
    onCancel();
    router.push(`/dashboard/${module}`);
  }, [onCancel, router, module]);

  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={handleCancel}>
        {t("create.buttons.cancel")}
      </Button>
      <Button
        disabled={!isFormValid || isCreatingStockMovement}
        onClick={onSubmit}
      >
        {isCreatingStockMovement ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("create.buttons.creating")}
          </>
        ) : (
          t("create.buttons.create")
        )}
      </Button>
    </div>
  );
}
