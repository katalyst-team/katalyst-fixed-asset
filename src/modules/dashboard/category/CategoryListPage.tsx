"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryItemType } from "@/types/category";

import CategoryListHeader from "./CategoryListHeader";
import CategoryListItem from "./CategoryListItem";
import CategoryModalAdd from "./CategoryModalAdd";
import { useCategoryList } from "./useCategoryList";

const CategoryListPage = () => {
  const { t } = useTranslation("category");
  const { categoryData, currentPage, isLoading, limit } = useCategoryList();

  const tableHeader = useMemo(
    () => [
      { className: "", label: t("table.header.no") },
      { className: "", label: t("table.header.categoryName") },
      { className: "text-center", label: t("table.header.code") },
      { className: "text-center", label: t("table.header.subCount") },
      { className: "", label: t("table.header.store") },
      { className: "text-center", label: t("table.header.action") },
    ],
    [t]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="flex w-full flex-col gap-4">
      <CategoryListHeader />
      {categoryData.length === 0 ? (
        <EmptyState
          action={<CategoryModalAdd />}
          description={t("empty.description")}
          title={t("empty.title")}
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
            {categoryData.map((item: CategoryItemType, index: number) => (
              <CategoryListItem
                key={item.id}
                item={item}
                num={(currentPage - 1) * limit + index + 1}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CategoryListPage;
