import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import { useGetPendingVerificationQuery } from "@/hooks/api/verification";
import { VerificationEntityType } from "@/types/verification";

import { VerificationHeader, VerificationTable } from "./components";

const LIMIT = 20;

const Verification = () => {
  const { t } = useTranslation("verification");
  const { tokenPayload, stores } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const router = useRouter();
  const urlInitialized = useRef(false);

  const [entityTypeFilter, setEntityTypeFilter] = useState<VerificationEntityType>(
    VerificationEntityType.STOCK_MOVEMENT_INBOUND,
  );
  const [storeFilter, setStoreFilter] = useState<string | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);

  // Initialize from URL once
  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.entity_type && Object.values(VerificationEntityType).includes(q.entity_type as VerificationEntityType)) {
      setEntityTypeFilter(q.entity_type as VerificationEntityType);
    }
    if (q.store_id) {
      setStoreFilter(q.store_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    if (storeFilter === undefined && stores.length > 0) {
      setStoreFilter(stores[0].id);
    }
  }, [stores, storeFilter]);

  const handleEntityTypeChange = (val: VerificationEntityType) => {
    setEntityTypeFilter(val);
    setCursor(undefined);
    setPageIndex(0);
    setCursorHistory([undefined]);
    const nextQuery = { ...router.query, entity_type: val };
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const handleStoreChange = (val: string | undefined) => {
    setStoreFilter(val);
    setCursor(undefined);
    setPageIndex(0);
    setCursorHistory([undefined]);
    const nextQuery = { ...router.query };
    if (val) {
      nextQuery.store_id = val;
    } else {
      delete nextQuery.store_id;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const storeId = storeFilter ?? "";

  const { data, isLoading, refetch } = useGetPendingVerificationQuery({
    cursor,
    enabled: !!organizationId && !!storeId,
    entityType: entityTypeFilter,
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
      <VerificationHeader
        entityTypeFilter={entityTypeFilter}
        storeFilter={storeFilter}
        stores={stores}
        onEntityTypeChange={handleEntityTypeChange}
        onStoreChange={handleStoreChange}
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
            entityTypeFilter={entityTypeFilter}
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

export default Verification;
