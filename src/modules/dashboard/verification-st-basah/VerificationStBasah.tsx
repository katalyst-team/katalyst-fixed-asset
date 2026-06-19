import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import { useGetPendingVerificationQuery } from "@/hooks/api/verification";
import { VerificationTable } from "@/modules/dashboard/verification/components";
import { StockMovementTypeNameEnum } from "@/services/stockMovement/getStockMovementDataService";
import { VerificationEntityType } from "@/types/verification";

import { VerificationStBasahHeader } from "./components";

const LIMIT = 20;

const VerificationStBasah = () => {
  const { t } = useTranslation("verification-st-basah");
  const { tokenPayload, stores } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [storeFilter, setStoreFilter] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);

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
    module: StockMovementTypeNameEnum.ST_BASAH_STORED,
    organizationId,
    storeId,
  });

  const items = data?.data?.items ?? [];
  const nextCursor = data?.pagination?.next_cursor ?? null;
  const prevCursor = data?.pagination?.prev_cursor ?? null;

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
      <VerificationStBasahHeader
        storeFilter={storeFilter}
        stores={stores}
        onStoreChange={(val) => {
          setStoreFilter(val);
          setCursor(undefined);
          setPageIndex(0);
          setCursorHistory([undefined]);
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
          <VerificationTable
            entityTypeFilter={VerificationEntityType.STOCK_MOVEMENT_INBOUND}
            items={items}
            limit={LIMIT}
            pageIndex={pageIndex}
            onRefresh={refetch}
          />
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
    </div>
  );
};

export default VerificationStBasah;
