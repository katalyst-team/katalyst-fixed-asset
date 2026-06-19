import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import useRevokeStockMovementMutation from "@/hooks/api/stockMovement/useRevokeStockMovementMutation";
import {
  useRejectVerificationMutation,
  useSubmitVerificationMutation,
  useVerifyVerificationMutation,
} from "@/hooks/api/verification";
import { usePermissions } from "@/hooks/usePermissions";
import {
  VerificationEntityType,
  VerificationStatus,
} from "@/types/verification";

import VerificationRejectModal from "./VerificationRejectModal";

interface VerificationActionsProps {
  currentStatus: VerificationStatus | undefined | null;
  entityId: string;
  entityType: VerificationEntityType;
  storeId: string;
  onStatusChange?: () => void;
}

const VerificationActions = ({
  currentStatus,
  entityId,
  entityType,
  storeId,
  onStatusChange,
}: VerificationActionsProps) => {
  const { t } = useTranslation("verification");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { canRejectStockMovement, canRevokeStockMovement, canVerifyStockMovement } = usePermissions();

  const revokeMutation = useRevokeStockMovementMutation({
    onError: () => toast.error(t("toast.revokeError")),
    onSuccess: () => {
      toast.success(t("toast.revokeSuccess"));
      onStatusChange?.();
    },
  });

  const submitMutation = useSubmitVerificationMutation({
    onError: () => toast.error(t("toast.submitError")),
    onSuccess: () => {
      toast.success(t("toast.submitSuccess"));
      onStatusChange?.();
    },
  });

  const verifyMutation = useVerifyVerificationMutation({
    onError: () => toast.error(t("toast.verifyError")),
    onSuccess: () => {
      toast.success(t("toast.verifySuccess"));
      onStatusChange?.();
    },
  });

  const rejectMutation = useRejectVerificationMutation({
    onError: () => toast.error(t("toast.rejectError")),
    onSuccess: () => {
      toast.success(t("toast.rejectSuccess"));
      setIsRejectModalOpen(false);
      onStatusChange?.();
    },
  });

  if (!currentStatus) return null;

  const params = { entityId, entityType, organizationId, storeId };

  const handleRejectConfirm = (note: string) => {
    rejectMutation.mutate({ ...params, note });
  };

  if (currentStatus === VerificationStatus.VERIFIED) {
    if (!canRevokeStockMovement) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          {t("status.VERIFIED")}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          {t("status.VERIFIED")}
        </span>
        <Button
          disabled={revokeMutation.isPending}
          size="sm"
          variant="outline"
          onClick={() => revokeMutation.mutate({
            organizationId,
            stockMovementId: entityId,
            storeId,
          })}
        >
          {t("buttons.revoke")}
        </Button>
      </div>
    );
  }

  if (currentStatus === VerificationStatus.CANCELLED) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
        {t("status.CANCELLED")}
      </span>
    );
  }

  if (currentStatus === VerificationStatus.REJECTED) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          {t("status.REJECTED")}
        </span>
        <Button
          disabled={submitMutation.isPending}
          size="sm"
          variant="outline"
          onClick={() => submitMutation.mutate(params)}
        >
          {t("buttons.resubmit")}
        </Button>
      </div>
    );
  }

  if (currentStatus === VerificationStatus.VALIDATED) {
    const hasAnyAction = canVerifyStockMovement || canRevokeStockMovement || canRejectStockMovement;
    if (!hasAnyAction) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {t("status.VALIDATED")}
        </span>
      );
    }
    return (
      <>
        <div className="flex items-center gap-2">
          {canVerifyStockMovement && (
            <Button
              disabled={verifyMutation.isPending}
              size="sm"
              variant="default"
              onClick={() => verifyMutation.mutate(params)}
            >
              {t("buttons.verify")}
            </Button>
          )}
          {canRevokeStockMovement && (
            <Button
              disabled={revokeMutation.isPending}
              size="sm"
              variant="outline"
              onClick={() => revokeMutation.mutate({
                organizationId,
                stockMovementId: entityId,
                storeId,
              })}
            >
              {t("buttons.revoke")}
            </Button>
          )}
          {canRejectStockMovement && (
            <Button
              disabled={rejectMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => setIsRejectModalOpen(true)}
            >
              {t("buttons.reject")}
            </Button>
          )}
        </div>
        <VerificationRejectModal
          isLoading={rejectMutation.isPending}
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleRejectConfirm}
        />
      </>
    );
  }

  if (currentStatus === VerificationStatus.SUBMITTED) {
    const hasAnyAction = canVerifyStockMovement || canRejectStockMovement;
    if (!hasAnyAction) {
      return (
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          {t("buttons.noPermission")}
        </span>
      );
    }
    return (
      <>
        <div className="flex items-center gap-2">
          {canVerifyStockMovement && (
            <Button
              disabled={verifyMutation.isPending}
              size="sm"
              variant="default"
              onClick={() => verifyMutation.mutate(params)}
            >
              {t("buttons.verify")}
            </Button>
          )}
          {canRejectStockMovement && (
            <Button
              disabled={rejectMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => setIsRejectModalOpen(true)}
            >
              {t("buttons.reject")}
            </Button>
          )}
        </div>
        <VerificationRejectModal
          isLoading={rejectMutation.isPending}
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleRejectConfirm}
        />
      </>
    );
  }

  // DRAFT
  return (
    <Button
      disabled={submitMutation.isPending}
      size="sm"
      variant="outline"
      onClick={() => submitMutation.mutate(params)}
    >
      {t("buttons.submit")}
    </Button>
  );
};

export default VerificationActions;
