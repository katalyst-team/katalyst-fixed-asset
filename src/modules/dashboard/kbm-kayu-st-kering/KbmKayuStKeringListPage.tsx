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

import KbmKayuStKeringListHeader from "./KbmKayuStKeringListHeader";
import KbmKayuStKeringListItem from "./KbmKayuStKeringListItem";
import KbmKayuStKeringModalAdd from "./KbmKayuStKeringModalAdd";
import { useKbmKayuStKeringList } from "./useKbmKayuStKeringList";

const KbmKayuStKeringListPage = () => {
  const { t } = useTranslation("kbm-kayu-st-kering");
  const { categoryData, currentPage, isLoading, limit } = useKbmKayuStKeringList();

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
      <KbmKayuStKeringListHeader />
      {categoryData.length === 0 ? (
        <EmptyState
          action={<KbmKayuStKeringModalAdd />}
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
              <KbmKayuStKeringListItem
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

export default KbmKayuStKeringListPage;
