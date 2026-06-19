"use client";

import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType } from "@/types/sku";

import { useKbmGradeConfig } from "./KbmGradeConfigContext";
import { useKbmGradeStore } from "./store/KbmGradeStore";
import { UniqueAttribute } from "./utils/attributeUtils";

// Category names for SUSUN/BATANG which share one category and use G_TYPE to differentiate
const KBM_GRADE_CATEGORY_NAMES = [
  "KBM Grade ST Susun",
  "KBM Grade ST Batang",
  "KBM Grade",
];
const ATTR_TYPE = "G_TYPE";

// Grade types that share a single category and rely on G_TYPE attribute filtering
const GRADE_TYPES_WITH_GTYPE = ["SUSUN", "BATANG"];

interface UseKbmGradeReturn {
  categoryAttributes: UniqueAttribute[];
  isLoadingKbmGradeData: boolean;
  kbmGradeCategoryId: string | undefined;
  kbmGradeData: SkuItemType[];
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number | null | undefined;
}

export const useKbmGrade = (): UseKbmGradeReturn => {
  const { gradeType, title } = useKbmGradeConfig();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const isGradeType = GRADE_TYPES_WITH_GTYPE.includes(gradeType);

  const itemsPerPage = useKbmGradeStore((state) => state.itemLimit);
  const filters = useKbmGradeStore(useShallow((state) => state.filters));
  const setFilters = useKbmGradeStore((state) => state.setFilters);

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoryDataQuery({ organizationId });

  // SUSUN/BATANG: find by shared category names list
  // Other types: find by exact title (e.g. "KBM Department")
  const kbmGradeCategory = useMemo(() => {
    if (!categoryData?.data?.categories) return undefined;
    if (isGradeType) {
      return categoryData.data.categories.find((category) =>
        KBM_GRADE_CATEGORY_NAMES.includes(category.name)
      );
    }
    return categoryData.data.categories.find(
      (category) => category.name === title
    );
  }, [categoryData, isGradeType, title]);

  const kbmGradeCategoryId = kbmGradeCategory?.id;

  // G_TYPE filtering only applies to SUSUN/BATANG
  const gTypeAttributeId = useMemo(() => {
    if (!isGradeType || !kbmGradeCategory?.attribute_items) return undefined;
    const typeAttribute = kbmGradeCategory.attribute_items.find(
      (item) => item.attribute?.name === ATTR_TYPE
    );
    return typeAttribute?.attribute?.id;
  }, [isGradeType, kbmGradeCategory]);

  const gTypeQueryAttributes = useMemo(() => {
    if (!gTypeAttributeId) return undefined;
    return JSON.stringify({ [gTypeAttributeId]: [gradeType] });
  }, [gTypeAttributeId, gradeType]);

  // Track if we've already set the default category filter
  const hasSetDefaultFilter = useRef(false);

  // Set default category filter when category data loads
  useEffect(() => {
    if (!kbmGradeCategoryId) return;
    // For non-grade types, only set category_ids (no G_TYPE filter)
    if (!isGradeType) {
      if (!hasSetDefaultFilter.current) {
        hasSetDefaultFilter.current = true;
        setFilters((prev) => ({
          ...prev,
          category_ids:
            prev.category_ids && prev.category_ids.length > 0
              ? prev.category_ids
              : [kbmGradeCategoryId],
          query_attributes: undefined,
        }));
      }
      return;
    }

    if (!gTypeQueryAttributes) return;

    if (!hasSetDefaultFilter.current) {
      hasSetDefaultFilter.current = true;
      setFilters((prev) => ({
        ...prev,
        category_ids:
          prev.category_ids && prev.category_ids.length > 0
            ? prev.category_ids
            : [kbmGradeCategoryId],
        query_attributes: gTypeQueryAttributes,
      }));
      return;
    }

    if (filters.query_attributes !== gTypeQueryAttributes) {
      setFilters((prev) => ({
        ...prev,
        query_attributes: gTypeQueryAttributes,
      }));
    }
  }, [filters.query_attributes, gTypeQueryAttributes, isGradeType, kbmGradeCategoryId, setFilters]);

  // Create filters for the query
  const queryFilters = useMemo(() => {
    const { cursor, ...otherFilters } = filters;
    if (!kbmGradeCategoryId) return otherFilters;
    return {
      ...otherFilters,
      category_ids: [kbmGradeCategoryId],
      cursor: cursor ?? undefined,
      limit: itemsPerPage,
      // Only send query_attributes for SUSUN/BATANG
      query_attributes: isGradeType
        ? (gTypeQueryAttributes ?? otherFilters.query_attributes)
        : undefined,
    };
  }, [filters, gTypeQueryAttributes, isGradeType, kbmGradeCategoryId, itemsPerPage]);

  const { data, isLoading, isFetching } = useGetSkuDataQuery({
    enabled: Boolean(organizationId) && Boolean(kbmGradeCategoryId),
    filters: queryFilters,
    organizationId,
  });

  // Build column definitions from category attribute_items — covers ALL attributes
  // regardless of which page/items are loaded, excluding G_TYPE
  const categoryAttributes = useMemo<UniqueAttribute[]>(() => {
    const items = kbmGradeCategory?.attribute_items ?? [];
    return items
      .filter((item) => item.attribute?.name && item.attribute.name !== "G_TYPE")
      .map((item) => ({
        id: item.attribute.id,
        name: item.attribute.name,
        type: (item.attribute.type as AttributeTypeEnum) ?? AttributeTypeEnum.TEXT,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [kbmGradeCategory]);

  return {
    categoryAttributes,
    isLoadingKbmGradeData: isLoading || isFetching || isCategoryLoading,
    kbmGradeCategoryId,
    kbmGradeData: data?.data?.skus ?? [],
    nextCursor: data?.pagination?.next_cursor ?? null,
    prevCursor: data?.pagination?.prev_cursor ?? null,
    totalCount: data?.pagination?.total_count,
  };
};
