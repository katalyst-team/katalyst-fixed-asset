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
import { AssignStatus } from "@/services/product/getProductService";
import { SkuDataFilters } from "@/services/sku/getSkuDataService";
import { AttributeTypeEnum } from "@/types/attribute";
import { SkuStatus, SkuType } from "@/types/sku";

import { useProductStore } from "./store";

const ProductFilter: React.FC = () => {
  const { t } = useTranslation(["product", "sku"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const router = useRouter();
  const urlInitialized = React.useRef(false);

  const { currentFilters, resetPagination, setFilters } = useProductStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  const getFiltersKey = React.useCallback(
    (filters: SkuDataFilters) => JSON.stringify(filters ?? {}),
    [],
  );

  const handleSetFilters = React.useCallback(
    (filters: SkuDataFilters) => {
      resetPagination();
      setFilters({
        assign_status: "UNASSIGNED",
        type: SkuType.UNIQUE,
        ...filters,
      });
    },
    [resetPagination, setFilters],
  );

  // API Data Fetching
  const { data: categoryData, isLoading: isLoadingCategories } =
    useGetCategoryDataQuery({ organizationId });
  const { data: attributeData, isLoading: isLoadingAttributes } =
    useGetAttributeDataQuery({ limit: 1000, organizationId });

  // State Management
  const [query, setQuery] = React.useState<string>("");
  const [internalCode, setInternalCode] = React.useState<string>("");
  const [status, setStatus] = React.useState<string | undefined>("all");
  const [assignStatus, setAssignStatus] =
    React.useState<AssignStatus>("UNASSIGNED");
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
    const urlAssignStatus = q.assign_status as AssignStatus | undefined;
    const urlCategoryId = q.category_id;
    const urlQueryAttributes = q.query_attributes;

    if (urlQuery) setQuery(urlQuery);
    if (urlInternalCode) setInternalCode(urlInternalCode);
    if (urlStatus) setStatus(urlStatus);
    if (urlAssignStatus) setAssignStatus(urlAssignStatus);
    if (urlCategoryId) setCategoryId(urlCategoryId);
    if (urlQueryAttributes) {
      try {
        const parsed = JSON.parse(urlQueryAttributes) as Record<string, string[]>;
        setSelectedAttributes(parsed);
      } catch {
        // ignore
      }
    }

    const hasFilters = urlQuery || urlInternalCode || urlStatus || urlAssignStatus || urlCategoryId || urlQueryAttributes;
    if (hasFilters) {
      handleSetFilters({
        assign_status: urlAssignStatus ?? "UNASSIGNED",
        category_ids: urlCategoryId ? [urlCategoryId] : undefined,
        internal_code: urlInternalCode || undefined,
        query: urlQuery || undefined,
        query_attributes: urlQueryAttributes || undefined,
        status: urlStatus as SkuStatus | undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Options for dropdowns
  const categoryOptions = React.useMemo(() => {
    const options = [
      {
        label: t("filter.options.allCategories", "All Categories"),
        value: "all",
      },
    ];
    if (categoryData?.data?.categories) {
      options.push(
        ...categoryData.data.categories.map((category) => ({
          label: category.name,
          value: category.id,
        })),
      );
    }
    return options;
  }, [categoryData, t]);

  const statusOptions = [
    { label: t("filter.allStatuses", "All Statuses"), value: "all" },
    { label: t("filter.active", "Active"), value: SkuStatus.ACTIVE },
    { label: t("filter.inactive", "Inactive"), value: SkuStatus.INACTIVE },
  ];

  const assignStatusOptions = [
    { label: t("filter.unassigned", "Unassigned"), value: "UNASSIGNED" },
    { label: t("filter.assigned", "Assigned"), value: "ASSIGNED" },
  ];

  const attributes = React.useMemo(() => {
    return attributeData?.data?.attributes || [];
  }, [attributeData]);

  // Handle attribute value selection
  const handleAttributeValueChange = (
    attributeId: string,
    value: string,
    checked: boolean,
  ) => {
    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      if (checked) {
        return {
          ...prev,
          [attributeId]: [...current, value],
        };
      }
      return {
        ...prev,
        [attributeId]: current.filter((v) => v !== value),
      };
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

    const newFilters: SkuDataFilters = {
      assign_status: assignStatus,
      category_ids: categoryId === "all" ? undefined : [categoryId as string],
      internal_code: internalCode || undefined,
      query: query || undefined,
      query_attributes:
        Object.keys(queryAttributes).length > 0
          ? JSON.stringify(queryAttributes)
          : undefined,
      status: status === "all" ? undefined : (status as SkuStatus),
    };

    if (getFiltersKey(newFilters) !== getFiltersKey(currentFilters)) {
      handleSetFilters(newFilters);
    }

    // Sync to URL
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.internal_code;
    delete nextQuery.status;
    delete nextQuery.assign_status;
    delete nextQuery.category_id;
    delete nextQuery.query_attributes;
    if (newFilters.query) nextQuery.query = newFilters.query;
    if (newFilters.internal_code) nextQuery.internal_code = newFilters.internal_code;
    if (newFilters.status) nextQuery.status = newFilters.status;
    if (newFilters.assign_status && newFilters.assign_status !== "UNASSIGNED") nextQuery.assign_status = newFilters.assign_status;
    if (newFilters.category_ids?.[0]) nextQuery.category_id = newFilters.category_ids[0];
    if (newFilters.query_attributes) nextQuery.query_attributes = newFilters.query_attributes;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setQuery("");
    setInternalCode("");
    setStatus("all");
    setAssignStatus("UNASSIGNED");
    setCategoryId("all");
    setSelectedAttributes({});
    setAttributeInputValues({});

    if (
      getFiltersKey({ assign_status: "UNASSIGNED", type: SkuType.UNIQUE }) !==
      getFiltersKey(currentFilters)
    ) {
      handleSetFilters({ assign_status: "UNASSIGNED", type: SkuType.UNIQUE });
    }

    // Clear URL params
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.internal_code;
    delete nextQuery.status;
    delete nextQuery.assign_status;
    delete nextQuery.category_id;
    delete nextQuery.query_attributes;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const hasActiveFilters =
    query ||
    internalCode ||
    status !== "all" ||
    assignStatus !== "UNASSIGNED" ||
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
          <h2 className="font-semibold">
            {t("filter.title", "Filter Options")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.search", "Search")}
            </Label>
            <Input
              placeholder={t("filter.searchPlaceholder", "Search products...")}
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
                "Enter internal code...",
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
            label={t("filter.assignStatus", "Assign Status")}
            options={assignStatusOptions}
            placeholder={t("filter.selectAssignStatus", "Select assign status")}
            value={assignStatus}
            onSelect={(value) => setAssignStatus(value as AssignStatus)}
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
                                    false,
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
                            <div
                              key={preset}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={
                                  selectedAttributes[attribute.id]?.includes(
                                    preset,
                                  ) || false
                                }
                                id={`${attribute.id}-${preset}`}
                                onCheckedChange={(checked) =>
                                  handleAttributeValueChange(
                                    attribute.id,
                                    preset,
                                    checked as boolean,
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
                      )}
                      {attribute.type === AttributeTypeEnum.BOOLEAN && (
                        <div className="space-y-1 pl-2">
                          {["true", "false"].map((value) => (
                            <div
                              key={value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={
                                  selectedAttributes[attribute.id]?.includes(
                                    value,
                                  ) || false
                                }
                                id={`${attribute.id}-${value}`}
                                onCheckedChange={(checked) =>
                                  handleAttributeValueChange(
                                    attribute.id,
                                    value,
                                    checked as boolean,
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
                      )}
                      {[
                        AttributeTypeEnum.TEXT,
                        AttributeTypeEnum.NUMBER,
                        AttributeTypeEnum.DATE,
                        AttributeTypeEnum.DATETIME,
                      ].includes(attribute.type) && (
                        <div className="space-y-2 pl-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder={
                                attribute.type === AttributeTypeEnum.NUMBER
                                  ? t(
                                      "filter.enterNumberValue",
                                      "Enter number...",
                                    )
                                  : t("filter.enterTextValue", "Enter value...")
                              }
                              type={
                                attribute.type === AttributeTypeEnum.NUMBER
                                  ? "number"
                                  : attribute.type === AttributeTypeEnum.DATE
                                    ? "date"
                                    : attribute.type ===
                                        AttributeTypeEnum.DATETIME
                                      ? "datetime-local"
                                      : "text"
                              }
                              value={attributeInputValues[attribute.id] || ""}
                              onChange={(e) =>
                                handleAttributeInputChange(
                                  attribute.id,
                                  e.target.value,
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
            <Button variant="ghost" onClick={handleReset}>
              {t("filter.reset", "Reset")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPopoverOpen(false)}>
                {t("filter.cancel", "Cancel")}
              </Button>
              <Button onClick={handleApply}>
                {t("filter.apply", "Apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProductFilter;
