import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";

import CategoryModalAddCategory from "./CategoryModalAddCategory";
import { useCategory } from "./useCategory";

const CategoryHeader: React.FC = () => {
  const { filters, setFilters } = useCategory();
  const { hasMultipleStores, stores } = useUser();
  const router = useRouter();
  const urlInitialized = useRef(false);

  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.store_id) {
      setFilters({ ...filters, store_id: q.store_id });
    } else if (!hasMultipleStores && stores.length === 1) {
      const storeId = stores[0].id;
      setFilters({ ...filters, store_id: storeId });
      void router.replace(
        { pathname: router.pathname, query: { ...router.query, store_id: storeId } },
        undefined,
        { shallow: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const handleStoreChange = (value: string) => {
    const storeId = value === "all" ? undefined : value;
    setFilters({ ...filters, store_id: storeId });
    const nextQuery = { ...router.query };
    if (storeId) {
      nextQuery.store_id = storeId;
    } else {
      delete nextQuery.store_id;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <div className="flex flex-col mt-4 lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={filters.store_id ?? "all"}
          onValueChange={handleStoreChange}
        >
          <SelectTrigger className="h-8 w-[180px]">
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
        <CategoryModalAddCategory />
      </div>
    </div>
  );
};

export default CategoryHeader;
