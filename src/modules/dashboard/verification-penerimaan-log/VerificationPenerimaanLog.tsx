import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
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
import useGetStockMovementTypesQuery from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useRevokeStockMovementMutation from "@/hooks/api/stockMovement/useRevokeStockMovementMutation";
import {
  useVerifyVerificationMutation,
} from "@/hooks/api/verification";
import { usePermissions } from "@/hooks/usePermissions";
import { StockMovementItem, StockMovementTypeNameEnum } from "@/services/stockMovement/getStockMovementDataService";
import { VerificationEntityType, VerificationStatus } from "@/types/verification";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

import { VerificationPenerimaanLogHeader } from "./components";

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
  item: StockMovementItem;
}

const ExpandedDetail = ({ item }: ExpandedDetailProps) => {
  const { t } = useTranslation("verification-penerimaan-log");

  return (
    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.editor")}</p>
          <p className="font-medium">{item.editor.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.section")}</p>
          <p className="font-medium">{item.section?.name || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.quantity")}</p>
          <p className="font-medium">{item.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.note")}</p>
          <p className="font-medium">{item.note || "-"}</p>
        </div>
      </div>

      {item.epcs && item.epcs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.epcs")} ({item.epcs.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {item.epcs.map((epc) => (
              <Badge key={epc.id} className="font-mono text-xs" variant="outline">
                {epc.name} — {epc.epc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {item.new_item_status_histories && item.new_item_status_histories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.items")} ({item.new_item_status_histories.length})
          </p>
          <div className="space-y-2">
            {item.new_item_status_histories.map((history, idx) => (
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

const VerificationPenerimaanLog = () => {
  const { t } = useTranslation("verification-penerimaan-log");
  const { tokenPayload, stores } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { canRevokeStockMovement, canVerifyStockMovement } = usePermissions();

  const [storeFilter, setStoreFilter] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);
  const [revokeTarget, setRevokeTarget] = useState<StockMovementItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (storeFilter === undefined && stores.length > 0) {
      setStoreFilter(stores[0].id);
    }
  }, [stores, storeFilter]);

  const storeId = storeFilter ?? "";

  const { data: smtData } = useGetStockMovementTypesQuery({
    filters: { direction: "INBOUND" },
    organizationId,
  });

  const penerimaanLogTypeId = useMemo(() => {
    const types = smtData?.data?.stock_movement_types ?? [];
    return types.find((smt) => smt.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND)?.id;
  }, [smtData?.data?.stock_movement_types]);

  const { data, isLoading, refetch } = useGetStockMovementDataQuery({
    enabled: !!organizationId && !!storeId && !!penerimaanLogTypeId,
    filters: {
      cursor,
      limit: LIMIT,
      stock_movement_type_ids: penerimaanLogTypeId ? [penerimaanLogTypeId] : [],
    },
    organizationId,
    storeId,
  });

  const visibleItems = useMemo(
    () => (data?.data?.stock_movements ?? []).filter(
      (item) => item.verification_status === VerificationStatus.VALIDATED,
    ),
    [data?.data?.stock_movements],
  );
  const nextCursor = data?.pagination?.next_cursor ?? null;
  const prevCursor = data?.pagination?.prev_cursor ?? null;

  const verifyMutation = useVerifyVerificationMutation({
    onError: () => toast.error(t("toast.verifyError")),
    onSuccess: () => {
      toast.success(t("toast.verifySuccess"));
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

  const handleVerify = (item: StockMovementItem) => {
    verifyMutation.mutate({
      entityId: item.id,
      entityType: VerificationEntityType.STOCK_MOVEMENT_INBOUND,
      organizationId,
      storeId,
    });
  };

  const handleRevokeConfirm = (note: string) => {
    if (!revokeTarget) return;
    revokeMutation.mutate({
      note,
      organizationId,
      stockMovementId: revokeTarget.id,
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
      <VerificationPenerimaanLogHeader
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
      ) : visibleItems.length === 0 && pageIndex === 0 ? (
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
                <TableHead className="text-center">{t("table.header.createdAt")}</TableHead>
                <TableHead className="text-center">{t("table.header.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={7}>
                    {t("table.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((item, index) => {
                  const rowNum = pageIndex * LIMIT + index + 1;
                  const isExpanded = expandedRows.has(item.id);
                  const hasDetail = (item.new_item_status_histories?.length ?? 0) > 0 || (item.epcs?.length ?? 0) > 0;

                  return (
                    <>
                      <TableRow
                        key={item.id}
                        className={`border-l-4 transition-colors ${
                          hasDetail ? "cursor-pointer" : "border-l-transparent"
                        } ${
                          isExpanded
                            ? "border-l-emerald-500 bg-emerald-50/60 hover:bg-emerald-50/80"
                            : "border-l-emerald-300 hover:bg-emerald-50/40"
                        }`}
                        onClick={() => hasDetail && toggleRow(item.id)}
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
                                  toggleRow(item.id);
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
                          {item.reference_number || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusVariant[item.verification_status ?? ""] ?? "secondary"}>
                            {item.verification_status ?? "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.editor?.name ?? "-"}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">{formatDateTime(item.created_at)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button asChild className="h-7 w-7 p-0" size="sm" variant="ghost">
                              <Link href={`/dashboard/inbound/${item.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {item.verification_status === VerificationStatus.VALIDATED && canVerifyStockMovement && (
                              <Button
                                className="h-7 px-2 text-xs"
                                disabled={verifyMutation.isPending}
                                size="sm"
                                variant="default"
                                onClick={() => handleVerify(item)}
                              >
                                {t("buttons.verify")}
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
                      {isExpanded && (
                        <TableRow key={`${item.id}-detail`}>
                          <TableCell className="py-0" colSpan={7}>
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

export default VerificationPenerimaanLog;
