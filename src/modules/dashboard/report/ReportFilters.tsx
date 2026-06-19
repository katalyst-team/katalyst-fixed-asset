"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { cn } from "@/lib/utils";

import { useReport } from "./useReport";

export const ReportFilters = () => {
  const { filters, setFilters } = useReport();
  const { t } = useTranslation("common");
  const { hasMultipleStores, tokenPayload, selectedTeam, setSelectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [storeId, setStoreId] = useState<string>(() =>
    !hasMultipleStores && selectedTeam ? selectedTeam : ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    filters.category_id || "",
  );
  const [direction, setDirection] = useState<string>(
    filters.stock_movement_direction || "",
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // API Data Fetching
  const { data: categoryData, isLoading: isLoadingCategories } =
    useGetCategoryDataQuery({
      organizationId,
    });
  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery({
    organizationId,
  });

  // Keep UI in sync if filters are pre-populated (e.g., after refetch)
  useEffect(() => {
    setCategoryId(filters.category_id || "");
    setDirection(filters.stock_movement_direction || "");
    if (!hasMultipleStores && selectedTeam) {
      setStoreId(selectedTeam);
    }

    if (filters.start_date && filters.end_date) {
      setDateRange({
        from: parseISO(filters.start_date),
        to: parseISO(filters.end_date),
      });
    }
  }, [
    filters.category_id,
    filters.end_date,
    filters.start_date,
    filters.stock_movement_direction,
    hasMultipleStores,
    selectedTeam,
  ]);

  const handleStoreChange = (value: string) => {
    setStoreId(value);
    setSelectedTeam(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
  };

  const handleDirectionChange = (value: string) => {
    setDirection(value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      !storeId ||
      !categoryId ||
      !direction ||
      !dateRange?.from ||
      !dateRange?.to
    );
  }, [categoryId, dateRange?.from, dateRange?.to, direction, storeId]);

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    setFilters({
      ...filters,
      category_id: categoryId,
      end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      start_date: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      stock_movement_direction: direction as "INBOUND" | "OUTBOUND",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end flex-wrap">
      {/* Store Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("filter.store", "Store")}
        </label>
        <Select value={storeId} onValueChange={handleStoreChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={
                isLoadingStores
                  ? t("loading", "Loading...")
                  : t("filter.storePlaceholder", "Select store...")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {storeData?.data?.stores?.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("filter.category", "Category")}
        </label>
        <Select value={categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={
                isLoadingCategories
                  ? t("loading", "Loading...")
                  : t("filter.categoryPlaceholder", "Select category...")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categoryData?.data?.categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Direction Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("filter.direction", "Direction")}
        </label>
        <Select value={direction} onValueChange={handleDirectionChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue
              placeholder={t(
                "filter.directionPlaceholder",
                "Select direction...",
              )}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INBOUND">
              {t("filter.options.inbound", "Inbound")}
            </SelectItem>
            <SelectItem value="OUTBOUND">
              {t("filter.options.outbound", "Outbound")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("filter.dateRange", "Date Range")}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
              id="date"
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>
                  {t("filter.dateRangePlaceholder", "Pick a date range")}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              initialFocus
              defaultMonth={dateRange?.from}
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onSelect={handleDateRangeChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Submit */}
      <div className="flex items-end">
        <Button disabled={isSubmitDisabled} onClick={handleSubmit}>
          {t("apply", "Apply")}
        </Button>
      </div>
    </div>
  );
};
