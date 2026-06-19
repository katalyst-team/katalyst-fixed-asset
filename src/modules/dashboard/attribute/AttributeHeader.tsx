import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { usePermissions } from "@/hooks/usePermissions";

import AttributeModalAdd from "./AttributeModalAdd";
import { useAttributeStore } from "./store/AttributeStore";

const VALID_LIMITS = [10, 20, 50, 100, 200, 500, 1000];
const SEARCH_DEBOUNCE_MS = 400;

interface AttributeHeaderProps {
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

const AttributeHeader = ({ nextCursor, prevCursor, totalCount }: AttributeHeaderProps) => {
  const router = useRouter();
  const { hasMultipleStores, tokenPayload } = useUser();
  const { canCreate } = usePermissions();
  const {
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    itemLimit,
    setCurrentPage,
    setFilters,
    setItemLimit,
  } = useAttributeStore();

  const [selectedDirection, setSelectedDirection] = useState<string>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [searchInput, setSearchInput] = useState(filters.query ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = storeData?.data?.stores ?? [];

  useEffect(() => {
    setSelectedDirection(filters.direction ?? "all");
    setSelectedStoreId(filters.store_id ?? "all");
  }, [filters.direction, filters.store_id]);

  const urlInitialized = useRef(false);

  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    const limitParam = Number(q.limit);
    if (VALID_LIMITS.includes(limitParam)) {
      setItemLimit(limitParam);
    }
    if (q.direction) {
      setSelectedDirection(q.direction);
      setFilters((prev) => ({ ...prev, cursor: undefined, direction: q.direction }));
    }
    if (q.store_id) {
      setSelectedStoreId(q.store_id);
      setFilters((prev) => ({ ...prev, cursor: undefined, store_id: q.store_id }));
    }
    if (q.query) {
      setSearchInput(q.query);
      setFilters((prev) => ({ ...prev, cursor: undefined, query: q.query }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, cursor: undefined, query: value || undefined }));
      setCurrentPage(1);
      const nextQuery = { ...router.query };
      if (value) {
        nextQuery.query = value;
      } else {
        delete nextQuery.query;
      }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleStoreChange = (value: string) => {
    setSelectedStoreId(value);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      store_id: value !== "all" ? value : undefined,
    }));
    setCurrentPage(1);
    const nextQuery = { ...router.query };
    if (value !== "all") {
      nextQuery.store_id = value;
    } else {
      delete nextQuery.store_id;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && selectedStoreId === "all") {
      handleStoreChange(stores[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  const handleDirectionChange = (value: string) => {
    setSelectedDirection(value);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      direction: value !== "all" ? value : undefined,
    }));
    setCurrentPage(1);
    const nextQuery = { ...router.query };
    if (value !== "all") {
      nextQuery.direction = value;
    } else {
      delete nextQuery.direction;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <div className="mt-4 flex w-full flex-col justify-between gap-2 lg:flex-row">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 w-full pl-8 text-sm lg:w-[200px]"
            placeholder="Search attribute..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={selectedStoreId} onValueChange={handleStoreChange}>
          <SelectTrigger className="h-8 w-full lg:w-[220px]">
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
        <Select value={selectedDirection} onValueChange={handleDirectionChange}>
          <SelectTrigger className="h-8 w-full lg:w-[220px]">
            <SelectValue placeholder="All Directions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="INBOUND">INBOUND</SelectItem>
            <SelectItem value="OUTBOUND">OUTBOUND</SelectItem>
          </SelectContent>
        </Select>
        {canCreate && <AttributeModalAdd attributeId="" type="create" />}
      </div>
      <div className="flex flex-col items-center gap-2 lg:flex-row">
        <Select
          value={String(itemLimit)}
          onValueChange={(value) => {
            setItemLimit(Number(value));
            setCurrentPage(1);
            setFilters((prev) => ({ ...prev, cursor: undefined }));
            router.replace(
              { query: { ...router.query, limit: value } },
              undefined,
              { shallow: true }
            );
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            {VALID_LIMITS.map((v) => (
              <SelectItem key={v} value={String(v)}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <PaginationCursor
          currentPage={currentPage}
          hasNextPage={Boolean(nextCursor)}
          hasPrevPage={Boolean(prevCursor)}
          limit={itemLimit}
          totalCount={totalCount}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({ ...prev, cursor: nextCursor }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({ ...prev, cursor: prevCursor }));
          }}
        />
      </div>
    </div>
  );
};

export default AttributeHeader;
