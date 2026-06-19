"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
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
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { cn } from "@/lib/utils";
import { IntervalType } from "@/services/dashboard/getInventoryTrendService";

import { useOverview } from "./useOverview";

export const OverviewFilters = () => {
  const { filters, updateFilter, stores, hasMultipleStores } = useOverview();
  const { t } = useTranslation(["overview"]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && !filters.store_ids) {
      updateFilter("store_ids", stores[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  // Fetch SKU data filtered by selected store
  const skuData = useGetSkuDataQuery({
    filters: {
      assigned_store_id: filters.store_ids,
      limit: 1000,
    },
    organizationId,
  });

  const handleIntervalChange = (value: IntervalType) => {
    updateFilter("interval", value);

    // Clear custom date range when switching away from CUSTOM
    if (value !== "CUSTOM") {
      updateFilter("start_date", undefined);
      updateFilter("end_date", undefined);
      setDateRange(undefined);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from) {
      updateFilter("start_date", format(range.from, "yyyy-MM-dd"));
    }

    if (range?.to) {
      updateFilter("end_date", format(range.to, "yyyy-MM-dd"));
    }

    // If date range is selected, automatically set interval to CUSTOM
    if (range?.from && range?.to) {
      updateFilter("interval", "CUSTOM");
    }
  };

  const handleStoreChange = (value: string) => {
    if (value === "all") {
      updateFilter("store_ids", undefined);
    } else {
      updateFilter("store_ids", value);
    }
  };

  const handleSkuChange = (value: string) => {
    if (value === "all") {
      updateFilter("sku_ids", undefined);
    } else {
      updateFilter("sku_ids", value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Store Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {t("filters.store.label")}
          </label>
          {filters.store_ids && (
            <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
              {stores.find((s) => s.id === filters.store_ids)?.name ?? filters.store_ids}
            </span>
          )}
        </div>
        <Select
          value={filters.store_ids || "all"}
          onValueChange={handleStoreChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.store.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.store.allStores")}</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SKU Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("filters.sku.label")}</label>
          {filters.sku_ids && (
            <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
              {skuData.data?.data?.skus?.find((s) => s.id === filters.sku_ids)?.name ?? filters.sku_ids}
            </span>
          )}
        </div>
        <Select
          value={filters.sku_ids || "all"}
          onValueChange={handleSkuChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.sku.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.sku.allSkus")}</SelectItem>
            {skuData.data?.data?.skus?.map((sku) => (
              <SelectItem key={sku.id} value={sku.id}>
                {sku.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Interval Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {t("filters.timePeriod.label")}
          </label>
          {filters.interval && filters.interval !== "1M" && (
            <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
              {filters.interval}
            </span>
          )}
        </div>
        <Select
          value={filters.interval || "1M"}
          onValueChange={handleIntervalChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.timePeriod.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1D">
              {t("filters.timePeriod.options.1d")}
            </SelectItem>
            <SelectItem value="7D">
              {t("filters.timePeriod.options.7d")}
            </SelectItem>
            <SelectItem value="1M">
              {t("filters.timePeriod.options.1m")}
            </SelectItem>
            <SelectItem value="3M">
              {t("filters.timePeriod.options.3m")}
            </SelectItem>
            <SelectItem value="CUSTOM">
              {t("filters.timePeriod.options.custom")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Picker */}
      {filters.interval === "CUSTOM" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("filters.dateRange.label")}
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
                  <span>{t("filters.dateRange.placeholder")}</span>
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
      )}
    </div>
  );
};
