import { Search } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";

import CategoryExportButton from "./CategoryExportButton";
import CategoryExportTemplateButton from "./CategoryExportTemplateButton";
import CategoryImportModal from "./CategoryImportModal";
import CategoryModalAdd from "./CategoryModalAdd";
import { useCategoryList } from "./useCategoryList";

const SEARCH_DEBOUNCE_MS = 400;

const CategoryListHeader = () => {
  const { t } = useTranslation("category");
  const {
    categoryData,
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    searchQuery,
    setFilters,
    setSearchQuery,
  } = useCategoryList();
  const { hasMultipleStores, stores, tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && !filters.store_id) {
      setFilters({ ...filters, store_id: stores[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  return (
    <div className="flex flex-col w-full gap-3 mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: store filter + create */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.store_id ?? "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, store_id: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder={t("list.filter.allStores")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("list.filter.allStores")}</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          <CategoryModalAdd />
        </div>

        {/* Right: search + excel buttons + pagination */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-8 pl-7 w-[180px] text-sm"
              placeholder={t("list.filter.searchPlaceholder")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CategoryExportTemplateButton />
            <CategoryImportModal organizationId={organizationId} />
            <CategoryExportButton categories={categoryData} />
          </div>
          <div className="shrink-0">
            <Pagination>
              <PaginationCursor
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onNext={goToNextPage}
                onPrev={goToPrevPage}
              />
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListHeader;
