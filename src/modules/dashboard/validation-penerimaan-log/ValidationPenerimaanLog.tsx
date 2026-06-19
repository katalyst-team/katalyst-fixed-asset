import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
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
import useRevokeStockMovementMutation from "@/hooks/api/stockMovement/useRevokeStockMovementMutation";
import useValidateStockMovementMutation from "@/hooks/api/stockMovement/useValidateStockMovementMutation";
import { useGetPendingVerificationQuery } from "@/hooks/api/verification";
import { usePermissions } from "@/hooks/usePermissions";
import { StockMovementTypeNameEnum } from "@/services/stockMovement/getStockMovementDataService";
import {
  VerificationEntityType,
  VerificationPendingItem,
} from "@/types/verification";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

import { ValidationPenerimaanLogHeader } from "./components";

const LIMIT = 20;

const statusVariant: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  CANCELLED: "destructive",
  DRAFT: "secondary",
  REJECTED: "destructive",
  SUBMITTED: "default",
  VALIDATED: "outline",
  VERIFIED: "outline",
};

interface ExpandedDetailProps {
  item: VerificationPendingItem;
}

const ExpandedDetail = ({ item }: ExpandedDetailProps) => {
  const { t } = useTranslation("validation-penerimaan-log");
  const detail = item.stock_movement_detail;

  if (!detail) return null;

  return (
    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.editor")}</p>
          <p className="font-medium">{detail.editor?.name ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.section")}</p>
          <p className="font-medium">{detail.section?.name || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.quantity")}</p>
          <p className="font-medium">{detail.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.note")}</p>
          <p className="font-medium">{detail.note || "-"}</p>
        </div>
      </div>

      {detail.epcs && detail.epcs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.epcs")} ({detail.epcs.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {detail.epcs.map((epc) => (
              <Badge key={epc.id} className="font-mono text-xs" variant="outline">
                {epc.name} — {epc.epc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {detail.new_item_status_histories && detail.new_item_status_histories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.items")} ({detail.new_item_status_histories.length})
          </p>
          <div className="space-y-2">
            {detail.new_item_status_histories.map((history, idx) => (
              <div key={history.item.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">#{idx + 1}</span>
                  <span className="font-medium">{history.item.sku?.name || history.item.epc || "-"}</span>
                  {history.item.sku?.internal_code && (
                    <Badge className="text-xs" variant="secondary">
                      {history.item.sku.internal_code}
                    </Badge>
                  )}
                  <Badge className="text-xs" variant="outline">
                    {convertToTitleCase(history.item.status.name)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ValidationPenerimaanLog = () => {
  const { t } = useTranslation("validation-penerimaan-log");
  const { tokenPayload, stores } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { canRevokeStockMovement, canValidateStockMovement } = usePermissions();

  const [storeFilter, setStoreFilter] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [revokeTarget, setRevokeTarget] = useState<VerificationPendingItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (storeFilter === undefined && stores.length > 0) {
      setStoreFilter(stores[0].id);
    }
  }, [stores, storeFilter]);

  const storeId = storeFilter ?? "";

  const { data, isLoading, refetch } = useGetPendingVerificationQuery({
    cursor,
    enabled: !!organizationId && !!storeId,
    entityType: VerificationEntityType.STOCK_MOVEMENT_INBOUND,
    module: StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND,
    organizationId,
    storeId,
  });

  const items = data?.data?.items ?? [];
  const nextCursor = data?.pagination?.next_cursor ?? null;
  const prevCursor = data?.pagination?.prev_cursor ?? null;

  const validateMutation = useValidateStockMovementMutation({
    onError: () => toast.error(t("toast.validateError")),
    onSuccess: () => {
      toast.success(t("toast.validateSuccess"));
      refetch();
    },
  });

  const revokeMutation = useRevokeStockMovementMutation({
    onError: () => toast.error(t("toast.revokeError")),
    onSuccess: () => {
      toast.success(t("toast.revokeSuccess"));
      setRevokeTarget(null);
      refetch();
    },
  });

  const handleValidate = (item: VerificationPendingItem) => {
    validateMutation.mutate({
      organizationId,
      stockMovementId: item.entity_id,
      storeId,
    });
  };

  const handleRevokeConfirm = (note: string) => {
    if (!revokeTarget) return;
    revokeMutation.mutate({
      note,
      organizationId,
      stockMovementId: revokeTarget.entity_id,
      storeId,
    });
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!nextCursor) return;
    const newHistory = [...cursorHistory, nextCursor];
    setCursorHistory(newHistory);
    setCursor(nextCursor);
    setPageIndex((p) => p + 1);
  };

  const handlePrev = () => {
    if (pageIndex === 0) return;
    const newHistory = cursorHistory.slice(0, -1);
    setCursorHistory(newHistory);
    setCursor(newHistory[newHistory.length - 1]);
    setPageIndex((p) => p - 1);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
      <ValidationPenerimaanLogHeader
        storeFilter={storeFilter}
        stores={stores}
        onStoreChange={(val) => {
          setStoreFilter(val);
          setCursor(undefined);
          setPageIndex(0);
          setCursorHistory([undefined]);
          setExpandedRows(new Set());
        }}
      />

      {isLoading ? (
        <Loading />
      ) : items.length === 0 && pageIndex === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{t("table.header.no")}</TableHead>
                <TableHead className="text-center">{t("table.header.referenceNumber")}</TableHead>
                <TableHead className="text-center">{t("table.header.status")}</TableHead>
                <TableHead className="text-center">{t("table.header.editor")}</TableHead>
                <TableHead className="text-center">{t("table.header.quantity")}</TableHead>
                <TableHead className="text-center">{t("table.header.store")}</TableHead>
                <TableHead className="text-center">{t("table.header.createdAt")}</TableHead>
                <TableHead className="text-center">{t("table.header.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={8}>
                    {t("table.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const rowNum = pageIndex * LIMIT + index + 1;
                  const isExpanded = expandedRows.has(item.entity_id);
                  const detail = item.stock_movement_detail;
                  const hasDetail = detail && (
                    (detail.new_item_status_histories?.length ?? 0) > 0 ||
                    (detail.epcs?.length ?? 0) > 0
                  );

                  return (
                    <>
                      <TableRow
                        key={item.entity_id}
                        className={`border-l-4 transition-colors ${
                          hasDetail ? "cursor-pointer" : "border-l-transparent"
                        } ${
                          isExpanded
                            ? "border-l-emerald-500 bg-emerald-50/60 hover:bg-emerald-50/80"
                            : "border-l-emerald-300 hover:bg-emerald-50/40"
                        }`}
                        onClick={() => hasDetail && toggleRow(item.entity_id)}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {hasDetail && (
                              <Button
                                className={`h-7 w-7 shrink-0 transition-colors ${
                                  isExpanded
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                }`}
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(item.entity_id);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <span>{rowNum}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium font-mono">
                          {detail?.reference_number || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusVariant[item.verification_status] ?? "secondary"}>
                            {item.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{detail?.editor?.name ?? item.title}</TableCell>
                        <TableCell className="text-center">{detail?.quantity ?? "-"}</TableCell>
                        <TableCell className="text-center">{item.store_name}</TableCell>
                        <TableCell className="text-center">{formatDateTime(item.created_at)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button asChild className="h-7 w-7 p-0" size="sm" variant="ghost">
                              <Link href={`/dashboard/inbound/${item.entity_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {canValidateStockMovement && (
                              <Button
                                className="h-7 px-2 text-xs"
                                disabled={validateMutation.isPending}
                                size="sm"
                                variant="default"
                                onClick={() => handleValidate(item)}
                              >
                                {t("buttons.validate")}
                              </Button>
                            )}
                            {canRevokeStockMovement && (
                              <Button
                                className="h-7 px-2 text-xs"
                                disabled={revokeMutation.isPending}
                                size="sm"
                                variant="outline"
                                onClick={() => setRevokeTarget(item)}
                              >
                                {t("buttons.revoke")}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && detail && (
                        <TableRow key={`${item.entity_id}-detail`}>
                          <TableCell className="py-0" colSpan={8}>
                            <ExpandedDetail item={item} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              disabled={pageIndex === 0}
              onClick={handlePrev}
            >
              {t("pagination.prev")}
            </button>
            <span className="text-sm text-muted-foreground">
              {t("pagination.page", { page: pageIndex + 1 })}
            </span>
            <button
              className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              disabled={!nextCursor && !prevCursor ? true : !nextCursor}
              onClick={handleNext}
            >
              {t("pagination.next")}
            </button>
          </div>
        </>
      )}

      <VerificationRejectModal
        isLoading={revokeMutation.isPending}
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  );
};

export default ValidationPenerimaanLog;
