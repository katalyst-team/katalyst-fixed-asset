"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useSubmitStockMovementMutation from "@/hooks/api/stockMovement/useSubmitStockMovementMutation";
import {
  StockMovementItem,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { VerificationStatus } from "@/types/verification";

import { StoreSelector } from "../components/StoreSelector";

const ITEM_LIMIT = 10;

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DraftVerification = () => {
  const router = useRouter();
  const { t } = useTranslation(["common", "penerimaan-log"]);
  const { tokenPayload, hasMultipleStores, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    !hasMultipleStores && selectedTeam && selectedTeam !== "0"
      ? selectedTeam
      : "0",
  );
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: stockMovementTypes } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const penerimaanLogTypeId = useMemo(() => {
    const found = (stockMovementTypes ?? []).find(
      (type) => type.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND,
    );
    return found?.id ?? "";
  }, [stockMovementTypes]);

  const effectiveStoreId = selectedStoreId !== "0" ? selectedStoreId : "";

  const filters = useMemo(
    () => ({
      cursor,
      limit: ITEM_LIMIT,
      stock_movement_type_ids: penerimaanLogTypeId
        ? [penerimaanLogTypeId]
        : undefined,
      verification_status: VerificationStatus.DRAFT,
    }),
    [cursor, penerimaanLogTypeId],
  );

  const { data, isLoading, isFetching } = useGetStockMovementDataQuery({
    enabled: Boolean(penerimaanLogTypeId),
    filters,
    organizationId,
    storeId: effectiveStoreId || selectedTeam || "",
  });

  const stockMovements = data?.data?.stock_movements ?? [];
  const nextCursor = data?.pagination?.next_cursor ?? undefined;
  const prevCursor = data?.pagination?.prev_cursor ?? undefined;
  const totalCount = data?.pagination?.total_count ?? undefined;

  const handleStoreChange = (value: string) => {
    setSelectedStoreId(value);
    setCursor(undefined);
    setCurrentPage(1);
  };

  const goToNextPage = useCallback(() => {
    if (nextCursor) {
      setCursor(nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (prevCursor) {
      setCursor(prevCursor);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [prevCursor]);

  useEffect(() => {
    setCursor(undefined);
    setCurrentPage(1);
  }, [selectedStoreId]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">Verifikasi Draft</h1>
          <p className="ks-page-desc">
            Daftar penerimaan log dengan status DRAFT untuk di-submit
          </p>
        </div>
        <div className="ks-page-actions">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/penerimaan-log")}
          >
            {t("common:button.back", "Kembali")}
          </Button>
        </div>
      </div>

      <div className="ks-card">
        <div className="ks-card-head">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="ks-card-title">Stock Movement (DRAFT)</h2>
              <p className="ks-card-desc">
                {totalCount !== undefined
                  ? `${totalCount} penerimaan menunggu submit`
                  : "Memuat..."}
              </p>
            </div>
            <StoreSelector
              value={selectedStoreId}
              onChange={handleStoreChange}
            />
          </div>
        </div>

        <div className="ks-card-body">
          {isLoading || isFetching ? (
            <Loading className="min-h-[40vh]" />
          ) : stockMovements.length === 0 ? (
            <EmptyState
              className="mt-4"
              description="Belum ada penerimaan log dengan status DRAFT"
              title="Tidak ada data"
            />
          ) : (
            <>
              <Table className="border shadow-md rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">No</TableHead>
                    <TableHead>Reference Number</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Editor</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map(
                    (item: StockMovementItem, index: number) => (
                      <DraftRow
                        key={item.id}
                        index={
                          currentPage * ITEM_LIMIT + index + 1 - ITEM_LIMIT
                        }
                        item={item}
                        organizationId={organizationId}
                        storeId={effectiveStoreId || selectedTeam || ""}
                      />
                    ),
                  )}
                </TableBody>
              </Table>

              <div className="mt-4">
                <PaginationCursor
                  currentPage={currentPage}
                  hasNextPage={Boolean(nextCursor)}
                  hasPrevPage={currentPage > 1}
                  limit={ITEM_LIMIT}
                  totalCount={totalCount}
                  onNext={goToNextPage}
                  onPrev={goToPrevPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface DraftRowProps {
  index: number;
  item: StockMovementItem;
  organizationId: string;
  storeId: string;
}

const DraftRow = ({ index, item, organizationId, storeId }: DraftRowProps) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync: submitStockMovement, isPending } =
    useSubmitStockMovementMutation({
      onSuccess: () => setOpen(false),
    });

  const handleSubmit = async () => {
    await submitStockMovement({
      organizationId,
      stockMovementId: item.id,
      storeId,
    });
  };

  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell className="font-medium">
        {item.reference_number ?? "-"}
      </TableCell>
      <TableCell className="max-w-[200px] truncate" title={item.note}>
        {item.note || "-"}
      </TableCell>
      <TableCell>{item.editor?.name ?? "-"}</TableCell>
      <TableCell className="whitespace-nowrap">
        {item.created_at ? formatDateTime(item.created_at) : "-"}
      </TableCell>
      <TableCell className="text-center">{item.quantity}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{item.verification_status ?? "DRAFT"}</Badge>
      </TableCell>
      <TableCell className="text-center">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              className="ks-btn ks-btn-primary ks-btn-sm"
              size="sm"
            >
              <Send className="mr-1 h-3 w-3" />
              Submit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Penerimaan Log</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin ingin men-submit penerimaan log{" "}
                <span className="font-medium">
                  {item.reference_number ?? item.id}
                </span>
                ? Status akan berubah dari DRAFT menjadi SUBMITTED.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? "Memproses..." : "Submit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

export default DraftVerification;
