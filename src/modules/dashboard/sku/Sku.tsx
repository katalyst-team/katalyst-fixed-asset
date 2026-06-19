"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkuItemType } from "@/types/sku";

import SkuHeader from "./SkuHeader";
import SkuItem from "./SkuItem";
import { useSkuStore } from "./store";
import { useSku } from "./useSku";

const Sku = () => {
  const { t } = useTranslation(["sku"]);
  const { skuData, isLoadingSkuData } = useSku();
  const router = useRouter();

  // Use Zustand store - get primitive values to avoid re-render loops
  const currentPage = useSkuStore((state) => state.currentPage);
  const itemLimit = useSkuStore((state) => state.itemLimit);

  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const tableHeader = useMemo(
    () => [
      t("sku:table.header.no"),
      t("sku:table.header.id", "ID"),
      t("sku:table.header.internalCode", "Internal Code"),
      t("sku:table.header.image"),
      t("sku:table.header.name"),
      t("sku:table.header.category"),
      t("sku:table.header.attributes"),
      t("sku:table.header.action"),
    ],
    [t]
  );

  return (
    <div
      className={`flex w-full gap-4 flex-col ${skuData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex-shrink-0">
        <SkuHeader
          showAllAttributes={showAllAttributes}
          onToggleShowAllAttributes={setShowAllAttributes}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${skuData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              {tableHeader.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoadingSkuData &&
              skuData.length > 0 &&
              skuData.map((item: SkuItemType, index: number) => (
                <SkuItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemLimit + index + 1 - itemLimit}
                  showAllAttributes={showAllAttributes}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingSkuData ? (
          <SkeletonTable columns={8} />
        ) : (
          skuData.length === 0 && (
            <EmptyState
              action={
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/sku/create")}
                >
                  {t("sku:modal.addSku.addButton")}
                </Button>
              }
              className="mt-4"
              description={t("empty.description")}
              title={t("empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Sku;
