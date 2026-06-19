import { useTranslation } from "next-i18next";
import { useEffect } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";

import CategoryExportButton from "../category/CategoryExportButton";
import KbmKayuLaminaModalAdd from "./KbmKayuLaminaModalAdd";
import { useKbmKayuLaminaList } from "./useKbmKayuLaminaList";

const KbmKayuLaminaListHeader = () => {
  const { t } = useTranslation("kbm-kayu-lamina");
  const {
    categoryData,
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    setFilters,
  } = useKbmKayuLaminaList();
  const { hasMultipleStores, stores } = useUser();

  useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && !filters.store_id) {
      setFilters({ ...filters, store_id: stores[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  return (
    <div className="flex flex-col w-full gap-3 mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <KbmKayuLaminaModalAdd />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
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

export default KbmKayuLaminaListHeader;
