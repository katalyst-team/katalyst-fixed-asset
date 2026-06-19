"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import SkeletonTable from "@/components/shared/SkeletonTable";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryItemType } from "@/types/category";

import CategoryHeader from "./CategoryHeader";
import CategoryItem from "./CategoryItem";
import CategoryModalAddCategory from "./CategoryModalAddCategory";
import { useCategory } from "./useCategory";

const Category = () => {
  const { t } = useTranslation("category");
  const {
    categoryData,
    currentPage,
    isLoading,
    itemsPerPage,
    setCurrentPage,
    totalItems,
  } = useCategory();

  const tableHeader = useMemo(
    () => [
      t("category.table.header.no"),
      t("category.table.header.categoryName"),
      t("category.table.header.action"),
    ],
    [t]
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <SkeletonTable columns={3} />;
  }

  return (
    <div className="flex w-full gap-4  flex-col">
      <CategoryHeader />
      {categoryData.length === 0 ? (
        <EmptyState
          action={<CategoryModalAddCategory />}
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <>
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {tableHeader.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryData.map((item: CategoryItemType, index: number) => (
                <CategoryItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                />
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-row flex-1 justify-end items-end w-full">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Category;
