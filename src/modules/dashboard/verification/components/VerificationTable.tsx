import { Eye, LayoutList } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import VerificationRejectModal from "@/components/shared/VerificationRejectModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import {
  useRejectVerificationMutation,
  useVerifyVerificationMutation,
} from "@/hooks/api/verification";
import { usePermissions } from "@/hooks/usePermissions";
import {
  VerificationEntityType,
  VerificationPendingItem,
  VerificationStatus,
} from "@/types/verification";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

import VerificationInboundRow from "./VerificationInboundRow";

const getDetailUrl = (item: VerificationPendingItem): string => {
  if (item.entity_type === VerificationEntityType.AUDIT_STOCK_OPNAME) {
    return `/dashboard/stock-audit/${item.store_id}/${item.entity_id}`;
  }
  return `/dashboard/inbound/${item.entity_id}`;
};

interface VerificationTableProps {
  entityTypeFilter: VerificationEntityType;
  items: VerificationPendingItem[];
  limit: number;
  pageIndex: number;
  onRefresh: () => void;
}

const statusVariant: Record<
  VerificationStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  CANCELLED: "destructive",
  DRAFT: "secondary",
  REJECTED: "destructive",
  SUBMITTED: "default",
  VALIDATED: "outline",
  VERIFIED: "outline",
};

const VerificationTable = ({
  entityTypeFilter,
  items,
  limit,
  pageIndex,
  onRefresh,
}: VerificationTableProps) => {
  const { t } = useTranslation("verification");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { canRejectStockMovement, canVerifyStockMovement, canRejectAudit, canVerifyAudit } = usePermissions();

  const [rejectTarget, setRejectTarget] = useState<VerificationPendingItem | null>(null);

  const isInbound = entityTypeFilter === VerificationEntityType.STOCK_MOVEMENT_INBOUND;
  const totalColumns = isInbound ? 10 : 7;

  const verifyMutation = useVerifyVerificationMutation({
    onError: () => toast.error(t("toast.verifyError")),
    onSuccess: () => {
      toast.success(t("toast.verifySuccess"));
      onRefresh();
    },
  });

  const rejectMutation = useRejectVerificationMutation({
    onError: () => toast.error(t("toast.rejectError")),
    onSuccess: () => {
      toast.success(t("toast.rejectSuccess"));
      setRejectTarget(null);
      onRefresh();
    },
  });

  const handleVerify = (item: VerificationPendingItem) => {
    verifyMutation.mutate({
      entityId: item.entity_id,
      entityType: item.entity_type,
      organizationId,
      storeId: item.store_id,
    });
  };

  const handleRejectConfirm = (note: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate({
      entityId: rejectTarget.entity_id,
      entityType: rejectTarget.entity_type,
      note,
      organizationId,
      storeId: rejectTarget.store_id,
    });
  };

  return (
    <>
      {isInbound && (
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-600">
          <LayoutList className="h-3.5 w-3.5 shrink-0" />
          {t("detail.expandHint")}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{t("table.header.no")}</TableHead>
            <TableHead className="text-center">{t("table.header.entityType")}</TableHead>
            <TableHead className="text-center">{t("table.header.title")}</TableHead>
            <TableHead className="text-center">{t("table.header.store")}</TableHead>
            <TableHead className="text-center">{t("table.header.status")}</TableHead>
            <TableHead className="text-center">{t("table.header.createdAt")}</TableHead>
            {isInbound && (
              <>
                <TableHead className="text-center">{t("table.header.editor")}</TableHead>
                <TableHead className="text-center">{t("table.header.section")}</TableHead>
                <TableHead className="text-center">{t("table.header.epcName")}</TableHead>
              </>
            )}
            <TableHead className="text-center">{t("table.header.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-center text-muted-foreground"
                colSpan={totalColumns}
              >
                {t("table.noData")}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => {
              const rowNum = pageIndex * limit + index + 1;

              if (item.entity_type === VerificationEntityType.STOCK_MOVEMENT_INBOUND) {
                return (
                  <VerificationInboundRow
                    key={item.entity_id}
                    canReject={canRejectStockMovement}
                    canVerify={canVerifyStockMovement}
                    index={rowNum}
                    isRejectPending={rejectMutation.isPending}
                    isVerifyPending={verifyMutation.isPending}
                    item={item}
                    totalColumns={totalColumns}
                    onReject={setRejectTarget}
                    onVerify={handleVerify}
                  />
                );
              }

              return (
                <TableRow key={item.entity_id}>
                  <TableCell className="text-center">{rowNum}</TableCell>
                  <TableCell className="text-center">
                    {t(`entityType.${item.entity_type}` as keyof object, item.entity_type)}
                  </TableCell>
                  <TableCell className="text-center">{convertToTitleCase(item.title)}</TableCell>
                  <TableCell className="text-center">{item.store_name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[item.verification_status]}>
                      {t(
                        `status.${item.verification_status}` as keyof object,
                        item.verification_status,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{formatDateTime(item.created_at)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={getDetailUrl(item)}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {item.verification_status === VerificationStatus.VALIDATED && (
                        <>
                          {canVerifyAudit && (
                            <Button
                              disabled={verifyMutation.isPending}
                              size="sm"
                              variant="default"
                              onClick={() => handleVerify(item)}
                            >
                              {t("buttons.verify")}
                            </Button>
                          )}
                          {canRejectAudit && (
                            <Button
                              disabled={rejectMutation.isPending}
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectTarget(item)}
                            >
                              {t("buttons.reject")}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <VerificationRejectModal
        isLoading={rejectMutation.isPending}
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
};

export default VerificationTable;
