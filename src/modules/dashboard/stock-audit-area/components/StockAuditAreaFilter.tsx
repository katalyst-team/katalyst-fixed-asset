import { Filter } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SortOption,
  StockAuditAreaFilterOptions,
} from "@/types/stock-audit-area";

interface StockAuditAreaFilterProps {
  onApply: (filters: StockAuditAreaFilterOptions) => void;
}

const StockAuditAreaFilter: React.FC<StockAuditAreaFilterProps> = ({
  onApply,
}) => {
  const { t } = useTranslation("stock-audit-area");

  // Convert Date to YYYY-MM-DD format for API
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State Management
  const [sort, setSort] = useState<SortOption | "all" | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const sortOptions = [
    { label: t("filter.options.allSorts"), value: "all" },
    { label: t("filter.options.discrepancy"), value: "DISCREPANCY" },
    { label: t("filter.options.lastAudit"), value: "LAST_AUDIT" },
    { label: t("filter.options.accuracy"), value: "ACCURACY" },
  ];

  const handleApplyFilters = () => {
    const filters: StockAuditAreaFilterOptions = {};

    if (sort && sort !== "all") filters.sort = sort as SortOption;
    if (date) filters.date = formatDateForAPI(date);

    onApply(filters);
    setIsPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setSort("all");
    setDate(undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (sort && sort !== "all") count++;
    if (date) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className="relative" size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> {t("filter.button")}
          {activeFiltersCount > 0 && (
            <Badge className="absolute -right-2 -top-2 flex justify-center items-center h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{t("filter.title")}</h4>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t("filter.sort.label")}</Label>
              <Combobox
                options={sortOptions}
                placeholder={t("filter.sort.placeholder")}
                value={sort || "all"}
                onSelect={(value) =>
                  setSort(value as SortOption | "all" | undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.date.label")}</Label>
              <DatePicker
                format="short"
                placeholder="DD/MM/YYYY"
                value={date}
                onChangeAction={(selectedDate) => setDate(selectedDate)}
              />
            </div>

          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleApplyFilters}>
              {t("filter.apply")}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleResetFilters}
            >
              {t("filter.reset")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StockAuditAreaFilter;
