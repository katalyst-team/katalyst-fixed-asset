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

import KbmKayuBulatListHeader from "./KbmKayuBulatListHeader";
import KbmKayuBulatListItem from "./KbmKayuBulatListItem";
import KbmKayuBulatModalAdd from "./KbmKayuBulatModalAdd";
import { useKbmKayuBulatList } from "./useKbmKayuBulatList";

const KbmKayuBulatListPage = () => {
  const { t } = useTranslation("kbm-kayu-bulat");
  const { categoryData, currentPage, isLoading, limit } = useKbmKayuBulatList();

  const attributeColumns = useMemo(() => {
    const seen = new Map<string, string>();
    for (const cat of categoryData) {
      for (const ai of cat.attribute_items ?? []) {
        if (ai.attribute?.id && !seen.has(ai.attribute.id)) {
          seen.set(ai.attribute.id, ai.attribute.name);
        }
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [categoryData]);

  const tableHeader = useMemo(
    () => [
      { className: "", label: t("table.header.no") },
      { className: "", label: t("table.header.categoryName") },
      { className: "text-center", label: t("table.header.code") },
      { className: "text-center", label: t("table.header.subCount") },
      { className: "", label: t("table.header.defaultGrade") },
      ...attributeColumns.map((col) => ({ className: "", label: col.name })),
      { className: "", label: t("table.header.store") },
      { className: "text-center", label: t("table.header.action") },
    ],
    [t, attributeColumns]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="flex w-full flex-col gap-4">
      <KbmKayuBulatListHeader />
      {categoryData.length === 0 ? (
        <EmptyState
          action={<KbmKayuBulatModalAdd />}
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
              <KbmKayuBulatListItem
                key={item.id}
                attributeColumns={attributeColumns}
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

export default KbmKayuBulatListPage;