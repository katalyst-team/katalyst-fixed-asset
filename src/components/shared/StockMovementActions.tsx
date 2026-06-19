"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import VerificationRejectModal from "@/components/shared/VerificationRejectModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import useCancelStockMovementMutation from "@/hooks/api/stockMovement/useCancelStockMovementMutation";
import useRevokeStockMovementMutation from "@/hooks/api/stockMovement/useRevokeStockMovementMutation";
import useValidateStockMovementMutation from "@/hooks/api/stockMovement/useValidateStockMovementMutation";
import {
  useRejectVerificationMutation,
  useSubmitVerificationMutation,
  useVerifyVerificationMutation,
} from "@/hooks/api/verification";
import { usePermissions } from "@/hooks/usePermissions";
import { VerificationActionParams, VerificationEntityType } from "@/types/verification";

interface StockMovementActionsProps {
  entityId: string;
  entityType: VerificationEntityType;
  storeId: string;
  verificationStatus?: string;
}

const StockMovementActions = ({
  entityId,
  entityType,
  storeId,
  verificationStatus,
}: StockMovementActionsProps) => {
  const { t } = useTranslation("verification");
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);

  const organizationId = tokenPayload?.organization_id ?? "";
  const {
    canCancelStockMovement,
    canRejectStockMovement,
    canRevokeStockMovement,
    canSubmitStockMovement,
    canValidateStockMovement,
    canVerifyStockMovement,
  } = usePermissions();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["stockMovementData"] });
  };

  const params: VerificationActionParams = {
    entityId,
    entityType,
    organizationId,
    storeId,
  };

  const stockMovementParams = {
    organizationId,
    stockMovementId: entityId,
    storeId,
  };

  const submitMutation = useSubmitVerificationMutation({
    onError: () => toast.error("Failed to submit"),
    onSuccess,
  });

  const validateMutation = useValidateStockMovementMutation({
    onError: () => toast.error("Failed to validate"),
    onSuccess,
  });

  const rejectMutation = useRejectVerificationMutation({
    onError: () => toast.error("Failed to reject"),
    onSuccess: () => {
      setRejectOpen(false);
      onSuccess();
    },
  });

  const verifyMutation = useVerifyVerificationMutation({
    onError: () => toast.error("Failed to verify"),
    onSuccess,
  });

  const revokeMutation = useRevokeStockMovementMutation({
    onError: () => toast.error("Failed to revoke"),
    onSuccess,
  });

  const cancelMutation = useCancelStockMovementMutation({
    onError: () => toast.error("Failed to cancel"),
    onSuccess,
  });

  if (verificationStatus === "VERIFIED") {
    if (canRevokeStockMovement || canCancelStockMovement) {
      return (
        <>
          <div className="flex items-center gap-1">
            <Badge className="border-transparent bg-green-100 text-green-700">
              Verified
            </Badge>
            {canRevokeStockMovement && (
              <Button
                className="h-6 px-2 text-xs"
                disabled={revokeMutation.isPending}
                size="sm"
                variant="outline"
                onClick={() => revokeMutation.mutate(stockMovementParams)}
              >
                Revoke
              </Button>
            )}
            {canCancelStockMovement && (
              <Button
                className="h-6 px-2 text-xs"
                disabled={cancelMutation.isPending}
                size="sm"
                variant="destructive"
                onClick={() => cancelMutation.mutate(stockMovementParams)}
              >
                Cancel
              </Button>
            )}
          </div>
        </>
      );
    }
    return (
      <Badge className="border-transparent bg-green-100 text-green-700">
        Verified
      </Badge>
    );
  }

  if (verificationStatus === "VALIDATED") {
    const hasAnyAction = canRevokeStockMovement || canVerifyStockMovement || canRejectStockMovement || canCancelStockMovement;
    if (!hasAnyAction) {
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-700">
          Validated
        </Badge>
      );
    }
    return (
      <>
        <div className="flex gap-1">
          {canVerifyStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={verifyMutation.isPending}
              size="sm"
              variant="default"
              onClick={() => verifyMutation.mutate(params)}
            >
              Verify
            </Button>
          )}
          {canRevokeStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={revokeMutation.isPending}
              size="sm"
              variant="outline"
              onClick={() => revokeMutation.mutate(stockMovementParams)}
            >
              Revoke
            </Button>
          )}
          {canRejectStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={rejectMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
          )}
          {canCancelStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={cancelMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => cancelMutation.mutate(stockMovementParams)}
            >
              Cancel
            </Button>
          )}
        </div>
        <VerificationRejectModal
          isLoading={rejectMutation.isPending}
          isOpen={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirm={(note) => rejectMutation.mutate({ ...params, note })}
        />
      </>
    );
  }

  if (verificationStatus === "CANCELLED") {
    return (
      <Badge className="border-transparent bg-red-100 text-red-700">
        Cancelled
      </Badge>
    );
  }

  if (verificationStatus === "DRAFT") {
    return (
      <div className="flex gap-1">
        {canSubmitStockMovement && (
          <Button
            className="h-6 px-2 text-xs"
            disabled={submitMutation.isPending}
            size="sm"
            variant="outline"
            onClick={() => submitMutation.mutate(params)}
          >
            Submit
          </Button>
        )}
        {canCancelStockMovement && (
          <Button
            className="h-6 px-2 text-xs"
            disabled={cancelMutation.isPending}
            size="sm"
            variant="destructive"
            onClick={() => cancelMutation.mutate(stockMovementParams)}
          >
            Cancel
          </Button>
        )}
      </div>
    );
  }

  if (verificationStatus === "REJECTED") {
    return (
      <div className="flex gap-1">
        {canSubmitStockMovement && (
          <Button
            className="h-6 px-2 text-xs"
            disabled={submitMutation.isPending}
            size="sm"
            variant="outline"
            onClick={() => submitMutation.mutate(params)}
          >
            Resubmit
          </Button>
        )}
        {canCancelStockMovement && (
          <Button
            className="h-6 px-2 text-xs"
            disabled={cancelMutation.isPending}
            size="sm"
            variant="destructive"
            onClick={() => cancelMutation.mutate(stockMovementParams)}
          >
            Cancel
          </Button>
        )}
      </div>
    );
  }

  if (verificationStatus === "SUBMITTED") {
    const hasAnyAction = canValidateStockMovement || canRejectStockMovement || canCancelStockMovement;
    if (!hasAnyAction) {
      return (
        <Badge className="border-transparent bg-muted text-muted-foreground">
          {t("buttons.noPermission")}
        </Badge>
      );
    }
    return (
      <>
        <div className="flex gap-1">
          {canValidateStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={validateMutation.isPending}
              size="sm"
              variant="default"
              onClick={() => validateMutation.mutate(stockMovementParams)}
            >
              Validate
            </Button>
          )}
          {canRejectStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={rejectMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
          )}
          {canCancelStockMovement && (
            <Button
              className="h-6 px-2 text-xs"
              disabled={cancelMutation.isPending}
              size="sm"
              variant="destructive"
              onClick={() => cancelMutation.mutate(stockMovementParams)}
            >
              Cancel
            </Button>
          )}
        </div>
        <VerificationRejectModal
          isLoading={rejectMutation.isPending}
          isOpen={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirm={(note) => rejectMutation.mutate({ ...params, note })}
        />
      </>
    );
  }

  return null;
};

export default StockMovementActions;
