/* eslint-disable max-lines */
"use client";

import { Filter, X } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { AttributeTypeEnum } from "@/types/attribute";
import { SkuFilterOptions, SkuStatus, SkuType } from "@/types/sku";

import { useSkuStore } from "./store";

const SkuFilter: React.FC = () => {
  const { t } = useTranslation("sku");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const router = useRouter();
  const urlInitialized = React.useRef(false);

  const { currentFilters, resetPagination, setFilters } = useSkuStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    }))
  );

  const getFiltersKey = React.useCallback(
    (filters: SkuFilterOptions) => JSON.stringify(filters ?? {}),
    []
  );

  const handleSetFilters = React.useCallback(
    (filters: SkuFilterOptions) => {
      resetPagination();
      setFilters({
        type: SkuType.COMMON,
        ...filters,
      });
    },
    [resetPagination, setFilters]
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

  // State Management
  const [query, setQuery] = React.useState<string>("");
  const [internalCode, setInternalCode] = React.useState<string>("");
  const [status, setStatus] = React.useState<string | undefined>("all");
  const [categoryId, setCategoryId] = React.useState<string | undefined>("all");
  const [selectedAttributes, setSelectedAttributes] = React.useState<
    Record<string, string[]>
  >({});
  const [attributeInputValues, setAttributeInputValues] = React.useState<
    Record<string, string>
  >({});
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Initialize from URL once
  React.useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    const urlQuery = q.query;
    const urlInternalCode = q.internal_code;
    const urlStatus = q.status;
    const urlCategoryId = q.category_id;
    const urlQueryAttributes = q.query_attributes;

    if (urlQuery) setQuery(urlQuery);
    if (urlInternalCode) setInternalCode(urlInternalCode);
    if (urlStatus) setStatus(urlStatus);
    if (urlCategoryId) setCategoryId(urlCategoryId);
    if (urlQueryAttributes) {
      try {
        const parsed = JSON.parse(urlQueryAttributes) as Record<string, string[]>;
        setSelectedAttributes(parsed);
      } catch {
        // ignore
      }
    }

    const hasFilters = urlQuery || urlInternalCode || urlStatus || urlCategoryId || urlQueryAttributes;
    if (hasFilters) {
      const parsedAttrs = urlQueryAttributes
        ? (() => {
            try {
              return JSON.parse(urlQueryAttributes) as Record<string, string[]>;
            } catch {
              return {};
            }
          })()
        : {};
      handleSetFilters({
        category_ids: urlCategoryId ? [urlCategoryId] : undefined,
        internal_code: urlInternalCode || undefined,
        query: urlQuery || undefined,
        query_attributes: urlQueryAttributes || undefined,
        status: urlStatus as SkuStatus | undefined,
      });
      setSelectedAttributes(parsedAttrs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Options for dropdowns
  const categoryOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.allCategories", "All Categories"), value: "all" },
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

  const statusOptions = [
    { label: t("filter.options.allStatuses", "All Statuses"), value: "all" },
    { label: t("status.active", "Active"), value: SkuStatus.ACTIVE },
    { label: t("status.inactive", "Inactive"), value: SkuStatus.INACTIVE },
  ];

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
      const newState = { ...prev };
      delete newState[attributeId];
      return newState;
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

    const filters: SkuFilterOptions = {
      category_ids: categoryId === "all" ? undefined : [categoryId as string],
      internal_code: internalCode || undefined,
      query: query || undefined,
      query_attributes:
        Object.keys(queryAttributes).length > 0
          ? JSON.stringify(queryAttributes)
          : undefined,
      status: status === "all" ? undefined : (status as SkuStatus),
    };

    if (getFiltersKey(filters) !== getFiltersKey(currentFilters)) {
      handleSetFilters(filters);
    }

    // Sync to URL
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.internal_code;
    delete nextQuery.status;
    delete nextQuery.category_id;
    delete nextQuery.query_attributes;
    if (filters.query) nextQuery.query = filters.query;
    if (filters.internal_code) nextQuery.internal_code = filters.internal_code;
    if (filters.status) nextQuery.status = filters.status;
    if (filters.category_ids?.[0]) nextQuery.category_id = filters.category_ids[0];
    if (filters.query_attributes) nextQuery.query_attributes = filters.query_attributes;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setQuery("");
    setInternalCode("");
    setStatus("all");
    setCategoryId("all");
    setSelectedAttributes({});
    setAttributeInputValues({});

    if (getFiltersKey({ type: SkuType.COMMON }) !== getFiltersKey(currentFilters)) {
      handleSetFilters({ type: SkuType.COMMON });
    }

    // Clear URL params
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.internal_code;
    delete nextQuery.status;
    delete nextQuery.category_id;
    delete nextQuery.query_attributes;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const hasActiveFilters =
    query ||
    internalCode ||
    status !== "all" ||
    categoryId !== "all" ||
    Object.keys(selectedAttributes).length > 0 ||
    Object.values(attributeInputValues).some((v) => v.trim());

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("filter.filter", "Filter")}
          {hasActiveFilters && (
            <Badge className="ml-2 h-4 w-4 p-0 text-xs" variant="secondary">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[500px] p-0 flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b bg-background">
          <h2 className="border-b border-border pb-3 mb-3 font-semibold text-sm">
            {t("filter.title", "Filter Options")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.search", "Search")}
            </Label>
            <Input
              placeholder={t("filter.searchPlaceholder", "Search SKU...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.internalCode", "Internal Code")}
            </Label>
            <Input
              placeholder={t(
                "filter.internalCodePlaceholder",
                "Enter internal code..."
              )}
              value={internalCode}
              onChange={(e) => setInternalCode(e.target.value)}
            />
          </div>

          <Combobox
            label={t("filter.status", "Status")}
            options={statusOptions}
            placeholder={t("filter.statusPlaceholder", "Select status...")}
            value={status}
            onSelect={setStatus}
          />

          <Combobox
            label={t("filter.category", "Category")}
            options={categoryOptions}
            placeholder={
              isLoadingCategories
                ? t("loading", "Loading...")
                : t("filter.categoryPlaceholder", "Select category...")
            }
            value={categoryId}
            onSelect={setCategoryId}
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
              <ScrollArea className="h-[200px] w-full border rounded-md p-2">
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
                      {(attribute.type === AttributeTypeEnum.SELECT ||
                        attribute.type === AttributeTypeEnum.CHECKBOX) && (
                        <div className="space-y-1 pl-2">
                          {(attribute.presets || []).map((preset) => (
                            <div key={preset} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedAttributes[attribute.id]?.includes(preset) || false}
                                id={`${attribute.id}-${preset}`}
                                onCheckedChange={(checked) =>
                                  handleAttributeValueChange(attribute.id, preset, checked as boolean)
                                }
                              />
                              <Label className="text-sm" htmlFor={`${attribute.id}-${preset}`}>{preset}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                      {attribute.type === AttributeTypeEnum.BOOLEAN && (
                        <div className="space-y-1 pl-2">
                          {["true", "false"].map((value) => (
                            <div key={value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedAttributes[attribute.id]?.includes(value) || false}
                                id={`${attribute.id}-${value}`}
                                onCheckedChange={(checked) =>
                                  handleAttributeValueChange(attribute.id, value, checked as boolean)
                                }
                              />
                              <Label className="text-sm" htmlFor={`${attribute.id}-${value}`}>
                                {value === "true" ? t("common.yes", "Yes") : t("common.no", "No")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                      {[AttributeTypeEnum.TEXT, AttributeTypeEnum.NUMBER, AttributeTypeEnum.DATE, AttributeTypeEnum.DATETIME].includes(attribute.type) && (
                        <div className="space-y-2 pl-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder={attribute.type === AttributeTypeEnum.NUMBER ? t("filter.enterNumberValue", "Enter number...") : t("filter.enterTextValue", "Enter value...")}
                              type={attribute.type === AttributeTypeEnum.NUMBER ? "number" : attribute.type === AttributeTypeEnum.DATE ? "date" : attribute.type === AttributeTypeEnum.DATETIME ? "datetime-local" : "text"}
                              value={attributeInputValues[attribute.id] || ""}
                              onChange={(e) => handleAttributeInputChange(attribute.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAttributeInputValue(attribute.id); } }}
                            />
                            <Button size="sm" type="button" onClick={() => addAttributeInputValue(attribute.id)}>Add</Button>
                          </div>
                        </div>
                      )}

                      {attributes.indexOf(attribute) <
                        attributes.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("filter.noAttributes", "No attributes available")}
              </div>
            )}
          </div>
        </div>
        <div className="border-t bg-background p-4">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              {t("filter.reset", "Reset")}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsPopoverOpen(false)}>
                {t("filter.cancel", "Cancel")}
              </Button>
              <Button variant="default" onClick={handleApply}>
                {t("filter.apply", "Apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SkuFilter;
