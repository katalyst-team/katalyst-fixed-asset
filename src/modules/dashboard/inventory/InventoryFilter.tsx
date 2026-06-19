/* eslint-disable max-lines */
"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementType,
  StockMovementTypeDirectionEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { AttributeTypeEnum } from "@/types/attribute";
import { InventoryFilterOptions } from "@/types/inventory";
import { RfidCategory } from "@/types/rfid";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

import { useInventoryStore } from "./store/InventoryStore";

const InventoryFilter: React.FC = () => {
  const { t } = useTranslation("inventory");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { setFilters, resetPagination, selectedStoreId } = useInventoryStore(
    useShallow((state) => ({
      resetPagination: state.resetPagination,
      selectedStoreId: state.selectedStoreId,
      setFilters: state.setFilters,
    }))
  );

  // API Data Fetching
  const { data: categoryData, isLoading: isLoadingCategories } =
    useGetCategoryDataQuery({
      organizationId,
    });

  const { data: attributeData, isLoading: isLoadingAttributes } =
    useGetAttributeDataQuery({
      limit: 1000,
      organizationId,
    });
  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  // State Management
  const [query, setQuery] = React.useState<string>("");
  const [categoryId, setCategoryId] = React.useState<string | undefined>("all");
  const [rfidCategory, setRfidCategory] = React.useState<string | undefined>(
    "all"
  );
  const [stockMovementTypeId, setStockMovementTypeId] = React.useState<
    string | undefined
  >("all");
  const [minAmount, setMinAmount] = React.useState<string>("");
  const [maxAmount, setMaxAmount] = React.useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = React.useState<
    Record<string, string[]>
  >({});
  const [attributeInputValues, setAttributeInputValues] = React.useState<
    Record<string, string>
  >({});
  const [open, setOpen] = React.useState(false);
  const urlInitialized = React.useRef(false);

  // Initialize filter state from URL on mount (once)
  React.useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    const urlStoreFilters: Partial<InventoryFilterOptions> = {};
    let hasFilters = false;
    if (q.query) { setQuery(q.query); urlStoreFilters.query = q.query; hasFilters = true; }
    if (q.category_id) { setCategoryId(q.category_id); urlStoreFilters.category_ids = [q.category_id]; hasFilters = true; }
    if (q.rfid_category) { setRfidCategory(q.rfid_category); urlStoreFilters.rfid_category = q.rfid_category as RfidCategory; hasFilters = true; }
    if (q.stock_movement_type_id) { setStockMovementTypeId(q.stock_movement_type_id); urlStoreFilters.stock_movement_type_id = q.stock_movement_type_id; hasFilters = true; }
    if (q.query_attributes) {
      try {
        const parsed = JSON.parse(q.query_attributes) as Record<string, string[]>;
        setSelectedAttributes(parsed);
        urlStoreFilters.query_attributes = q.query_attributes;
        hasFilters = true;
      } catch { /* ignore invalid JSON */ }
    }
    if (hasFilters) {
      setFilters((prev) => ({ ...prev, ...urlStoreFilters }));
      resetPagination();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Options for dropdowns
  const categoryOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.allCategories"), value: "all" },
    ];
    if (categoryData?.data?.categories) {
      options.push(
        ...categoryData.data.categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))
      );
    }
    return options;
  }, [categoryData, t]);

  const rfidCategories = [
    { label: t("filter.options.allRfidCategories"), value: "all" },
    { label: t("rfidCategory.single"), value: RfidCategory.SINGLE },
    { label: t("rfidCategory.package"), value: RfidCategory.PACKAGE },
  ];

  const stockMovementTypeOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.allStockMovementTypes"), value: "all" },
    ];

    options.push(
      ...(stockMovementTypesData ?? [])
        .filter(
          (type: StockMovementType) =>
            type.direction === StockMovementTypeDirectionEnum.INBOUND
        )
        .map((type: StockMovementType) => ({
          label: formatStockMovementTypeName(type.name),
          value: type.id,
        }))
    );

    return options;
  }, [stockMovementTypesData, t]);

  const attributes = React.useMemo(() => {
    return attributeData?.data?.attributes || [];
  }, [attributeData]);

  // Handle attribute value selection
  const handleAttributeValueChange = (
    attributeId: string,
    value: string,
    checked: boolean
  ) => {
    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      if (checked) {
        return {
          ...prev,
          [attributeId]: [...current, value],
        };
      } else {
        return {
          ...prev,
          [attributeId]: current.filter((v) => v !== value),
        };
      }
    });
  };

  // Handle input-based attribute values (TEXT, NUMBER, DATE, DATETIME)
  const handleAttributeInputChange = (attributeId: string, value: string) => {
    setAttributeInputValues((prev) => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  // Add input value to selected attributes
  const addAttributeInputValue = (attributeId: string) => {
    const value = attributeInputValues[attributeId];
    if (!value?.trim()) return;

    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      if (!current.includes(value)) {
        return {
          ...prev,
          [attributeId]: [...current, value],
        };
      }
      return prev;
    });

    // Clear input after adding
    setAttributeInputValues((prev) => ({
      ...prev,
      [attributeId]: "",
    }));
  };

  // Remove attribute filter
  const removeAttributeFilter = (attributeId: string) => {
    setSelectedAttributes((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [attributeId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleApply = () => {
    // Build query_attributes JSON
    const queryAttributes: Record<string, string[]> = {};
    Object.entries(selectedAttributes).forEach(([attributeId, values]) => {
      if (values.length > 0) {
        queryAttributes[attributeId] = values;
      }
    });

    const filters: InventoryFilterOptions = {
      category_ids: categoryId === "all" ? undefined : [categoryId as string],
      query: query || undefined,
      query_attributes:
        Object.keys(queryAttributes).length > 0
          ? JSON.stringify(queryAttributes)
          : undefined,
      rfid_category:
        rfidCategory === "all" ? undefined : (rfidCategory as RfidCategory),
      stock_movement_type_id:
        stockMovementTypeId === "all" ? undefined : stockMovementTypeId,
      store_id: selectedStoreId !== "0" ? selectedStoreId : undefined,
    };

    resetPagination();
    setFilters(filters);

    const nextQuery = { ...router.query };
    if (query) nextQuery.query = query; else delete nextQuery.query;
    if (categoryId && categoryId !== "all") nextQuery.category_id = categoryId; else delete nextQuery.category_id;
    if (rfidCategory && rfidCategory !== "all") nextQuery.rfid_category = rfidCategory; else delete nextQuery.rfid_category;
    if (stockMovementTypeId && stockMovementTypeId !== "all") nextQuery.stock_movement_type_id = stockMovementTypeId; else delete nextQuery.stock_movement_type_id;
    const qaStr = Object.keys(queryAttributes).length > 0 ? JSON.stringify(queryAttributes) : undefined;
    if (qaStr) nextQuery.query_attributes = qaStr; else delete nextQuery.query_attributes;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setOpen(false);
  };

  const handleCancel = () => {
    setQuery("");
    setCategoryId("all");
    setRfidCategory("all");
    setStockMovementTypeId("all");
    setMinAmount("");
    setMaxAmount("");
    setSelectedAttributes({});
    setAttributeInputValues({});

    resetPagination();
    setFilters({
      store_id: selectedStoreId !== "0" ? selectedStoreId : undefined,
    });

    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.category_id;
    delete nextQuery.rfid_category;
    delete nextQuery.stock_movement_type_id;
    delete nextQuery.query_attributes;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setOpen(false);
  };

  const hasActiveFilters =
    query ||
    categoryId !== "all" ||
    rfidCategory !== "all" ||
    stockMovementTypeId !== "all" ||
    minAmount !== "" ||
    maxAmount !== "" ||
    Object.keys(selectedAttributes).length > 0 ||
    Object.values(attributeInputValues).some((v) => v.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("filter.button")}
          {hasActiveFilters && (
            <Badge className="ml-2 h-4 w-4 p-0 text-xs" variant="secondary">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[500px] p-0 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold">{t("filter.title")}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("filter.search")}</Label>
            <Input
              placeholder={t("filter.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Min/Max Amount Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("filter.minAmount", "Min Amount")}
              </Label>
              <Input
                placeholder={t("filter.minAmountPlaceholder", "Min amount...")}
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("filter.maxAmount", "Max Amount")}
              </Label>
              <Input
                placeholder={t("filter.maxAmountPlaceholder", "Max amount...")}
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          <Combobox
            label={t("filter.category")}
            options={categoryOptions}
            placeholder={
              isLoadingCategories
                ? t("loading", "Loading...")
                : t("filter.categoryPlaceholder")
            }
            value={categoryId}
            onSelect={setCategoryId}
          />

          <Combobox
            label={t("filter.rfidCategory")}
            options={rfidCategories}
            placeholder={t("filter.rfidCategoryPlaceholder")}
            value={rfidCategory}
            onSelect={setRfidCategory}
          />

          <Combobox
            label={t("filter.stockMovementType")}
            options={stockMovementTypeOptions}
            placeholder={t("filter.stockMovementTypePlaceholder")}
            value={stockMovementTypeId}
            onSelect={setStockMovementTypeId}
          />

          {/* Attributes Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.attributes", "Attributes")}
            </Label>
            {isLoadingAttributes ? (
              <div className="text-sm text-muted-foreground">
                {t("loading", "Loading...")}
              </div>
            ) : attributes.length > 0 ? (
              <div className="space-y-3">
                {attributes.map((attribute) => (
                  <div key={attribute.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {attribute.name}
                      </Label>
                      <Badge className="text-xs" variant="outline">
                        {attribute.type}
                      </Badge>
                    </div>

                    {/* Show selected values as badges */}
                    {selectedAttributes[attribute.id]?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedAttributes[attribute.id].map((value) => (
                          <Badge
                            key={value}
                            className="text-xs"
                            variant="secondary"
                          >
                            {value}
                            <Button
                              className="ml-1 h-3 w-3 p-0 hover:bg-destructive"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAttributeValueChange(
                                  attribute.id,
                                  value,
                                  false
                                )
                              }
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                        <Button
                          className="h-5 text-xs"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttributeFilter(attribute.id)}
                        >
                          Clear all
                        </Button>
                      </div>
                    )}

                    {/* Attribute value selection based on type */}
                    {attribute.type === AttributeTypeEnum.SELECT ||
                    attribute.type === AttributeTypeEnum.CHECKBOX ? (
                      <div className="space-y-1 pl-2">
                        {(attribute.presets || []).map((preset) => (
                          <div
                            key={preset}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={
                                selectedAttributes[attribute.id]?.includes(
                                  preset
                                ) || false
                              }
                              id={`${attribute.id}-${preset}`}
                              onCheckedChange={(checked) =>
                                handleAttributeValueChange(
                                  attribute.id,
                                  preset,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              className="text-sm"
                              htmlFor={`${attribute.id}-${preset}`}
                            >
                              {preset}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : attribute.type === AttributeTypeEnum.BOOLEAN ? (
                      <div className="space-y-1 pl-2">
                        {["true", "false"].map((value) => (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={
                                selectedAttributes[attribute.id]?.includes(
                                  value
                                ) || false
                              }
                              id={`${attribute.id}-${value}`}
                              onCheckedChange={(checked) =>
                                handleAttributeValueChange(
                                  attribute.id,
                                  value,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              className="text-sm"
                              htmlFor={`${attribute.id}-${value}`}
                            >
                              {value === "true"
                                ? t("common.yes", "Yes")
                                : t("common.no", "No")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : attribute.type === AttributeTypeEnum.TEXT ? (
                      <div className="space-y-2 pl-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder={t(
                              "filter.enterTextValue",
                              "Enter text value..."
                            )}
                            value={attributeInputValues[attribute.id] || ""}
                            onChange={(e) =>
                              handleAttributeInputChange(
                                attribute.id,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addAttributeInputValue(attribute.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() =>
                              addAttributeInputValue(attribute.id)
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : attribute.type === AttributeTypeEnum.NUMBER ? (
                      <div className="space-y-2 pl-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder={t(
                              "filter.enterNumberValue",
                              "Enter number value..."
                            )}
                            type="number"
                            value={attributeInputValues[attribute.id] || ""}
                            onChange={(e) =>
                              handleAttributeInputChange(
                                attribute.id,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addAttributeInputValue(attribute.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() =>
                              addAttributeInputValue(attribute.id)
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : attribute.type === AttributeTypeEnum.DATE ? (
                      <div className="space-y-2 pl-2">
                        <Collapsible>
                          <div className="flex gap-2">
                            <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                              <span className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {attributeInputValues[attribute.id]
                                  ? format(new Date(attributeInputValues[attribute.id]), "PPP")
                                  : <span className="text-muted-foreground">{t("filter.pickDate", "Pick a date")}</span>}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </CollapsibleTrigger>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => addAttributeInputValue(attribute.id)}
                            >
                              Add
                            </Button>
                          </div>
                          <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={attributeInputValues[attribute.id] ? new Date(attributeInputValues[attribute.id]) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  handleAttributeInputChange(attribute.id, format(date, "yyyy-MM-dd"));
                                }
                              }}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ) : attribute.type === AttributeTypeEnum.DATETIME ? (
                      <div className="space-y-2 pl-2">
                        <Collapsible>
                          <div className="flex gap-2">
                            <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground">
                              <span className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {attributeInputValues[attribute.id]
                                  ? format(new Date(attributeInputValues[attribute.id]), "PPP HH:mm")
                                  : <span className="text-muted-foreground">{t("filter.pickDatetime", "Pick date & time")}</span>}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </CollapsibleTrigger>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => addAttributeInputValue(attribute.id)}
                            >
                              Add
                            </Button>
                          </div>
                          <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={attributeInputValues[attribute.id] ? new Date(attributeInputValues[attribute.id]) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const existing = attributeInputValues[attribute.id];
                                  const time = existing ? existing.split("T")[1] ?? "00:00" : "00:00";
                                  handleAttributeInputChange(attribute.id, `${format(date, "yyyy-MM-dd")}T${time}`);
                                }
                              }}
                            />
                            <div className="border-t p-3">
                              <Input
                                className="w-full"
                                type="time"
                                value={attributeInputValues[attribute.id]?.split("T")[1] ?? ""}
                                onChange={(e) => {
                                  const existing = attributeInputValues[attribute.id];
                                  const datePart = existing ? existing.split("T")[0] : format(new Date(), "yyyy-MM-dd");
                                  handleAttributeInputChange(attribute.id, `${datePart}T${e.target.value}`);
                                }}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground pl-2">
                        {t(
                          "filter.attributeTypeNotSupported",
                          "This attribute type is not supported for filtering"
                        )}
                      </div>
                    )}

                    {attributes.indexOf(attribute) <
                      attributes.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("filter.noAttributes", "No attributes available")}
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-background p-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {t("filter.reset", "Reset")}
            </Button>
            <Button onClick={handleApply}>{t("filter.apply")}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InventoryFilter;
