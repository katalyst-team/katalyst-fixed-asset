"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetPackingCollectionDataQuery from "@/hooks/api/packing-collection/useGetPackingCollectionDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";

import PackingCollectionModalAdd from "./PackingCollectionModalAdd";
import { usePackingCollectionStore } from "./store";

const PackingCollectionHeader = () => {
  const { tokenPayload } = useUser();
  const router = useRouter();
  const urlInitialized = useRef(false);
  const {
    filters,
    setFilters,
    itemLimit,
    setItemLimit,
    goToNextPage,
    goToPrevPage,
    resetPagination,
    currentPage,
  } = usePackingCollectionStore();

  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = storeData?.data?.stores ?? [];

  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.store_id) {
      setSelectedStoreId(q.store_id);
      setFilters((prev) => ({ ...prev, cursor: undefined, store_id: q.store_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const handleStoreChange = (value: string) => {
    setSelectedStoreId(value);
    resetPagination();
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      store_id: value !== "all" ? value : undefined,
    }));
    const nextQuery = { ...router.query };
    if (value !== "all") {
      nextQuery.store_id = value;
    } else {
      delete nextQuery.store_id;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const requestFilters = useMemo(
    () => ({
      ...filters,
      cursor: filters.cursor ?? undefined,
      limit: itemLimit,
    }),
    [filters, itemLimit]
  );

  const { data: packingCollectionData } = useGetPackingCollectionDataQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const handleItemLimitChange = (value: string) => {
    setItemLimit(Number(value));
    resetPagination();
    setFilters((prev) => ({ ...prev, cursor: undefined }));
  };

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between">
      <div className="flex flex-col lg:flex-row gap-2">
        <PackingCollectionModalAdd type="create" />
        <Select value={selectedStoreId} onValueChange={handleStoreChange}>
          <SelectTrigger className="lg:max-w-[200px]">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 items-center">
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
          Page {currentPage}
        </span>
        <Select value={String(itemLimit)} onValueChange={handleItemLimitChange}>
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          hasNextPage={Boolean(packingCollectionData?.pagination?.next_cursor)}
          hasPrevPage={Boolean(packingCollectionData?.pagination?.prev_cursor)}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({
              ...prev,
              cursor: packingCollectionData?.pagination?.next_cursor,
            }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({
              ...prev,
              cursor: packingCollectionData?.pagination?.prev_cursor,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default PackingCollectionHeader;
