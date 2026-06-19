"use client";

import { Filter } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { ProductFilterOptions } from "@/services/product/getProductService";
import { SkuStatus } from "@/types/sku";

import AttributeFilterSection from "./AttributeFilterSection";
import { useLedgerProductStore } from "./store";

interface LedgerProductFilterProps {
  onFiltersChange?: (partial: Partial<ProductFilterOptions>) => void;
}

const DateRangeInput: React.FC<{
  endValue: string;
  label: string;
  startValue: string;
  onEndChange: (v: string) => void;
  onStartChange: (v: string) => void;
}> = ({ endValue, label, startValue, onEndChange, onStartChange }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center gap-2">
      <Input
        className="h-8 text-sm"
        placeholder="Start"
        type="date"
        value={startValue}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <span className="text-muted-foreground text-xs shrink-0">–</span>
      <Input
        className="h-8 text-sm"
        placeholder="End"
        type="date"
        value={endValue}
        onChange={(e) => onEndChange(e.target.value)}
      />
    </div>
  </div>
);

const LedgerProductFilter: React.FC<LedgerProductFilterProps> = ({ onFiltersChange }) => {
  const { t } = useTranslation(["common", "ledger-product"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { currentFilters, resetPagination, setFilters } = useLedgerProductStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    }))
  );

  const applyFilters = React.useCallback(
    (partial: Partial<ProductFilterOptions>) => {
      resetPagination();
      if (onFiltersChange) {
        onFiltersChange(partial);
      } else {
        setFilters((prev) => ({ ...prev, ...partial }));
      }
    },
    [onFiltersChange, resetPagination, setFilters]
  );

  const [status, setStatus] = React.useState<SkuStatus | "all">(currentFilters.status ?? "all");
  const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string[]>>({});
  const [attributeInputValues, setAttributeInputValues] = React.useState<Record<string, string>>({});
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Date range state
  const [inboundStart, setInboundStart] = React.useState(currentFilters.inbound_date_start ?? "");
  const [inboundEnd, setInboundEnd] = React.useState(currentFilters.inbound_date_end ?? "");
  const [outboundStart, setOutboundStart] = React.useState(currentFilters.outbound_date_start ?? "");
  const [outboundEnd, setOutboundEnd] = React.useState(currentFilters.outbound_date_end ?? "");
  const [areaStart, setAreaStart] = React.useState(currentFilters.area_transfer_date_start ?? "");
  const [areaEnd, setAreaEnd] = React.useState(currentFilters.area_transfer_date_end ?? "");

  // Aging range state
  const [agingMin, setAgingMin] = React.useState(
    currentFilters.aging_days_min != null ? String(currentFilters.aging_days_min) : ""
  );
  const [agingMax, setAgingMax] = React.useState(
    currentFilters.aging_days_max != null ? String(currentFilters.aging_days_max) : ""
  );

  const { data: attributeData, isLoading: isLoadingAttributes } = useGetAttributeDataQuery({
    limit: 1000,
    organizationId,
  });

  React.useEffect(() => {
    setStatus(currentFilters.status ?? "all");
    setInboundStart(currentFilters.inbound_date_start ?? "");
    setInboundEnd(currentFilters.inbound_date_end ?? "");
    setOutboundStart(currentFilters.outbound_date_start ?? "");
    setOutboundEnd(currentFilters.outbound_date_end ?? "");
    setAreaStart(currentFilters.area_transfer_date_start ?? "");
    setAreaEnd(currentFilters.area_transfer_date_end ?? "");
    setAgingMin(currentFilters.aging_days_min != null ? String(currentFilters.aging_days_min) : "");
    setAgingMax(currentFilters.aging_days_max != null ? String(currentFilters.aging_days_max) : "");

    if (currentFilters.query_attributes) {
      setSelectedAttributes(currentFilters.query_attributes as Record<string, string[]>);
    } else {
      setSelectedAttributes({});
    }
  }, [currentFilters]);

  const attributes = React.useMemo(() => attributeData?.data?.attributes || [], [attributeData]);

  const handleAttributeValueChange = (attributeId: string, value: string, checked: boolean) => {
    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      return {
        ...prev,
        [attributeId]: checked ? [...current, value] : current.filter((v) => v !== value),
      };
    });
  };

  const handleAttributeInputChange = (attributeId: string, value: string) => {
    setAttributeInputValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const addAttributeInputValue = (attributeId: string) => {
    const value = attributeInputValues[attributeId];
    if (!value?.trim()) return;
    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      return current.includes(value) ? prev : { ...prev, [attributeId]: [...current, value] };
    });
    setAttributeInputValues((prev) => ({ ...prev, [attributeId]: "" }));
  };

  const removeAttributeFilter = (attributeId: string) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev };
      delete next[attributeId];
      return next;
    });
  };

  const handleApply = () => {
    const queryAttributes: Record<string, string[]> = {};
    Object.entries(selectedAttributes).forEach(([id, vals]) => {
      if (vals.length > 0) queryAttributes[id] = vals;
    });

    const partial: Partial<ProductFilterOptions> = {
      aging_days_max: agingMax !== "" ? Number(agingMax) : undefined,
      aging_days_min: agingMin !== "" ? Number(agingMin) : undefined,
      area_transfer_date_end: areaEnd || undefined,
      area_transfer_date_start: areaStart || undefined,
      inbound_date_end: inboundEnd || undefined,
      inbound_date_start: inboundStart || undefined,
      outbound_date_end: outboundEnd || undefined,
      outbound_date_start: outboundStart || undefined,
      query_attributes: Object.keys(queryAttributes).length > 0 ? queryAttributes : undefined,
      status: status === "all" ? undefined : status,
    };

    applyFilters(partial);
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setStatus("all");
    setSelectedAttributes({});
    setAttributeInputValues({});
    setInboundStart(""); setInboundEnd("");
    setOutboundStart(""); setOutboundEnd("");
    setAreaStart(""); setAreaEnd("");
    setAgingMin(""); setAgingMax("");

    applyFilters({
      aging_days_max: undefined,
      aging_days_min: undefined,
      area_transfer_date_end: undefined,
      area_transfer_date_start: undefined,
      inbound_date_end: undefined,
      inbound_date_start: undefined,
      outbound_date_end: undefined,
      outbound_date_start: undefined,
      query_attributes: undefined,
      status: undefined,
    });
    setIsPopoverOpen(false);
  };

  const hasActiveFilters =
    status !== "all" ||
    Object.keys(selectedAttributes).length > 0 ||
    !!inboundStart || !!inboundEnd ||
    !!outboundStart || !!outboundEnd ||
    !!areaStart || !!areaEnd ||
    agingMin !== "" || agingMax !== "";

  const activeFilterCount = [
    status !== "all",
    Object.keys(selectedAttributes).length > 0,
    !!inboundStart || !!inboundEnd,
    !!outboundStart || !!outboundEnd,
    !!areaStart || !!areaEnd,
    agingMin !== "" || agingMax !== "",
  ].filter(Boolean).length;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className="w-full sm:w-auto" size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("ledger-product:filter.filter", "Filter")}
          {hasActiveFilters && (
            <Badge className="ml-2 h-5 min-w-5 px-1 text-[10px]" variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[90vw] max-w-[520px] p-0 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold">{t("ledger-product:filter.title", "Filter Options")}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* SKU Status */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("ledger-product:filter.status", "SKU Status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as SkuStatus | "all")}>
              <SelectTrigger className="h-8 w-full text-sm">
                <SelectValue placeholder={t("ledger-product:filter.selectStatus", "Select status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ledger-product:filter.allStatuses", "All Statuses")}</SelectItem>
                <SelectItem value={SkuStatus.ACTIVE}>{t("ledger-product:filter.active", "Active")}</SelectItem>
                <SelectItem value={SkuStatus.INACTIVE}>{t("ledger-product:filter.inactive", "Inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date range filters */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("ledger-product:filter.dateRanges", "Date Ranges")}
            </p>
            <DateRangeInput
              endValue={inboundEnd}
              label={t("ledger-product:table.header.inboundDate", "Inbound Date")}
              startValue={inboundStart}
              onEndChange={setInboundEnd}
              onStartChange={setInboundStart}
            />
            <DateRangeInput
              endValue={outboundEnd}
              label={t("ledger-product:table.header.outboundDate", "Outbound Date")}
              startValue={outboundStart}
              onEndChange={setOutboundEnd}
              onStartChange={setOutboundStart}
            />
            <DateRangeInput
              endValue={areaEnd}
              label={t("ledger-product:table.header.areaTransferDate", "Area Transfer Date")}
              startValue={areaStart}
              onEndChange={setAreaEnd}
              onStartChange={setAreaStart}
            />
          </div>

          <Separator />

          {/* Aging days */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("ledger-product:table.header.agingDays", "Aging (days)")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className="h-8 text-sm"
                min={0}
                placeholder="Min"
                type="number"
                value={agingMin}
                onChange={(e) => setAgingMin(e.target.value)}
              />
              <span className="text-muted-foreground text-xs shrink-0">–</span>
              <Input
                className="h-8 text-sm"
                min={0}
                placeholder="Max"
                type="number"
                value={agingMax}
                onChange={(e) => setAgingMax(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Attributes */}
          <AttributeFilterSection
            attributeInputValues={attributeInputValues}
            attributes={attributes}
            isLoadingAttributes={isLoadingAttributes}
            selectedAttributes={selectedAttributes}
            onAddAttributeInputValue={addAttributeInputValue}
            onAttributeInputChange={handleAttributeInputChange}
            onAttributeValueChange={handleAttributeValueChange}
            onRemoveAttributeFilter={removeAttributeFilter}
          />
        </div>

        <div className="border-t bg-background p-4">
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleReset}>
              {t("ledger-product:filter.reset", "Reset")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPopoverOpen(false)}>
                {t("ledger-product:filter.cancel", "Cancel")}
              </Button>
              <Button onClick={handleApply}>
                {t("ledger-product:filter.apply", "Apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LedgerProductFilter;
