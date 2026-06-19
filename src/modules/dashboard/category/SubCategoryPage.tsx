"use client";

import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetCategoryByIdQuery from "@/hooks/api/category/useGetCategoryByIdQuery";
import useGetSubcategoriesQuery from "@/hooks/api/category/useGetSubcategoriesQuery";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import { CategoryItemType } from "@/types/category";
import { ReferenceItemType } from "@/types/reference";

import { CategoryAttributeItem } from "./CategoryAttributeSelector";
import CategoryDirectView from "./CategoryDirectView";
import SubCategoryHeader from "./SubCategoryHeader";
import SubCategoryItem from "./SubCategoryItem";
import SubCategoryModalAdd from "./SubCategoryModalAdd";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_LIMIT = 20;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

interface SubCategoryPageProps {
  categoryId: string;
  hideBack?: boolean;
  onSubCategoriesLoad?: (subs: CategoryItemType[]) => void;
  simplifiedEdit?: boolean;
  subAttributes?: CategoryAttributeItem[];
}

const SubCategoryPage = ({ categoryId, hideBack, onSubCategoriesLoad, simplifiedEdit, subAttributes }: SubCategoryPageProps) => {
  const { t } = useTranslation("category");
  const { hasMultipleStores, selectedTeam, tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [storeId, setStoreId] = useState<string | undefined>(() =>
    !hasMultipleStores && selectedTeam && selectedTeam !== "0" ? selectedTeam : undefined
  );
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCurrentPage(1);
  }, []);

  useEffect(() => { resetPagination(); }, [debouncedSearch, storeId, limit, resetPagination]);

  useEffect(() => {
    if (!hasMultipleStores && selectedTeam && selectedTeam !== "0" && storeId === undefined) {
      setStoreId(selectedTeam);
    }
  }, [hasMultipleStores, selectedTeam, storeId]);

  const { data: categoryData, isLoading: isCategoryLoading } = useGetCategoryByIdQuery({
    categoryId,
    organizationId,
  });

  const parentCategory = useMemo<CategoryItemType | undefined>(
    () => categoryData?.data ?? undefined,
    [categoryData]
  );

  const parentAttributeItems = useMemo<CategoryAttributeItem[]>(() => {
    if (!parentCategory?.attribute_items) return [];
    return parentCategory.attribute_items.map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));
  }, [parentCategory]);

  const parentAttributeDefaults = useMemo(() => {
    if (!parentCategory?.attribute_defaults) return [];
    return parentCategory.attribute_defaults.map((d) => ({
      attribute_id: d.attribute.attribute.id,
      values: d.values,
    }));
  }, [parentCategory]);

  const isDirectMode =
    parentCategory !== undefined &&
    !parentCategory.has_subcategories &&
    (parentCategory.attribute_items?.length ?? 0) > 0;

  const { data: subData, isLoading: isSubLoading } = useGetSubcategoriesQuery({
    categoryId,
    cursor,
    limit,
    organizationId,
    query: debouncedSearch.trim() || undefined,
    storeId,
  });

  const subCategories: CategoryItemType[] = useMemo(
    () => subData?.data?.subcategories ?? [],
    [subData]
  );

  useEffect(() => {
    if (onSubCategoriesLoad && subCategories.length > 0) {
      onSubCategoriesLoad(subCategories);
    }
  }, [onSubCategoriesLoad, subCategories]);

  const nextCursor = subData?.pagination?.next_cursor || undefined;
  const prevCursor = subData?.pagination?.prev_cursor || undefined;

  const goToNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursor(nextCursor);
    setCurrentPage((p) => p + 1);
  }, [nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (!prevCursor) return;
    setCursor(prevCursor);
    setCurrentPage((p) => Math.max(1, p - 1));
  }, [prevCursor]);

  const attributeColumns = useMemo(() => {
    const seen = new Map<string, string>();
    const valueCount = new Map<string, number>();

    for (const sub of subCategories) {
      for (const ai of sub.attribute_items ?? []) {
        if (ai.attribute?.id && !seen.has(ai.attribute.id)) {
          seen.set(ai.attribute.id, ai.attribute.name);
        }
      }
      for (const d of sub.attribute_defaults ?? []) {
        if (d.values.length > 0) {
          const id = d.attribute.attribute.id;
          valueCount.set(id, (valueCount.get(id) ?? 0) + 1);
        }
      }
    }

    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => {
        const countDiff = (valueCount.get(b.id) ?? 0) - (valueCount.get(a.id) ?? 0);
        return countDiff !== 0 ? countDiff : a.name.localeCompare(b.name);
      });
  }, [subCategories]);

  const refGroupIds = useMemo(() => {
    const groupIdsSet = new Set<string>();
    for (const sub of subCategories) {
      for (const d of sub.attribute_defaults ?? []) {
        if (d.attribute.attribute.type === "REFERENCE_GROUP") {
          const groupId = d.attribute.attribute.presets?.[0];
          if (groupId) groupIdsSet.add(groupId);
        }
      }
    }
    return Array.from(groupIdsSet);
  }, [subCategories]);

  const refItemsQueries = useGetReferenceItemsQuery({
    enabled: refGroupIds.length > 0 && Boolean(organizationId),
    groupId: refGroupIds[0] || "",
    organizationId,
  });

  const refItemsByGroup = useMemo(() => {
    const result: Record<string, { id: string; name: string }[]> = {};
    for (const groupId of refGroupIds) {
      if (groupId === refGroupIds[0]) {
        const items = refItemsQueries.data?.data?.items || [];
        result[groupId] = items.map((item: ReferenceItemType) => ({ id: item.id, name: item.name }));
      }
    }
    return result;
  }, [refGroupIds, refItemsQueries.data]);

  const tableHeader = useMemo(
    () => [
      { className: "", label: t("sub.table.header.no") },
      { className: "", label: simplifiedEdit ? "Grade Name" : t("sub.table.header.name") },
      { className: "text-center", label: t("sub.table.header.code") },
      { className: "", label: t("sub.table.header.store") },
      ...attributeColumns.map((col) => ({ className: "", label: col.name })),
      { className: "", label: "Nama Pembuat" },
      { className: "", label: "Nama Pengubah" },
      { className: "text-center", label: t("sub.table.header.action") },
    ],
    [t, attributeColumns, simplifiedEdit]
  );

  if (isCategoryLoading) return <Loading />;

  if (isDirectMode) {
    return <CategoryDirectView category={parentCategory!} />;
  }

  const allSubCategories = subCategories;
  const pageOffset = (currentPage - 1) * limit;

  return (
    <div className="flex w-full flex-col gap-4">
      <SubCategoryHeader
        categoryId={categoryId}
        categoryName={parentCategory?.name || ""}
        currentPage={currentPage}
        hasNextPage={Boolean(nextCursor)}
        hasPrevPage={Boolean(prevCursor)}
        hideBack={hideBack}
        limit={limit}
        parentAttributeDefaults={parentAttributeDefaults}
        parentAttributeItems={parentAttributeItems}
        searchQuery={searchQuery}
        showBulkApplyAttributes={!simplifiedEdit}
        storeId={storeId}
        subCategories={allSubCategories}
        onLimitChange={setLimit}
        onNext={goToNextPage}
        onPrev={goToPrevPage}
        onSearchChange={setSearchQuery}
        onStoreIdChange={setStoreId}
      />

      {isSubLoading ? (
        <Loading />
      ) : subCategories.length === 0 ? (
        <EmptyState
          action={<SubCategoryModalAdd categoryId={categoryId} parentAttributeDefaults={parentAttributeDefaults} parentAttributeItems={parentAttributeItems} simplifiedMode={simplifiedEdit} subAttributes={subAttributes} />}
          description={simplifiedEdit ? "No Grade in this Category yet" : t("sub.empty.description")}
          title={simplifiedEdit ? "No Grade" : t("sub.empty.title")}
        />
      ) : (
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              {tableHeader.map((header) => (
                <TableHead key={header.label} className={header.className}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.map((sub: CategoryItemType, index: number) => (
              <SubCategoryItem
                key={sub.id}
                attributeColumns={attributeColumns}
                categoryId={categoryId}
                item={sub}
                num={pageOffset + index + 1}
                refItemsByGroup={refItemsByGroup}
                simplifiedEdit={simplifiedEdit}
                templateOptions={[]}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SubCategoryPage;
