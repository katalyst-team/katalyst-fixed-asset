"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
import { useUser } from "@/context/user-context";
import { SkuImportModal } from "@/modules/dashboard/sku/components/SkuImportModal";
import { SkuTemplateExportModal } from "@/modules/dashboard/sku/components/SkuTemplateExportModal";
import { SkuItemType, SkuType } from "@/types/sku";

import ProductHeader from "./ProductHeader";
import ProductItem from "./ProductItem";
import { useProductStore } from "./store";
import { useProduct } from "./useProduct";

const Product = () => {
  const { t } = useTranslation(["product", "sku"]);
  const { skuData, isLoadingProductData } = useProduct();
  const router = useRouter();
  const { selectedTeam } = useUser();

  // Use Zustand store - get primitive values to avoid re-render loops
  const currentPage = useProductStore((state) => state.currentPage);
  const itemLimit = useProductStore((state) => state.itemLimit);
  const filters = useProductStore(useShallow((state) => state.filters));

  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const tableHeader = useMemo(
    () => [
      t("product:table.header.no", {
        defaultValue: t("sku:table.header.no"),
      }),
      t("product:table.header.id", {
        defaultValue: t("sku:table.header.id", "ID"),
      }),
      t("product:table.header.internalCode", {
        defaultValue: t("sku:table.header.internalCode", "Internal Code"),
      }),
      t("product:table.header.image", {
        defaultValue: t("sku:table.header.image"),
      }),
      t("product:table.header.name", {
        defaultValue: t("sku:table.header.name"),
      }),
      t("product:table.header.category", {
        defaultValue: t("sku:table.header.category"),
      }),
      t("product:table.header.attributes", {
        defaultValue: t("sku:table.header.attributes"),
      }),
      t("product:table.header.action", {
        defaultValue: t("sku:table.header.action"),
      }),
    ],
    [t]
  );

  const importFilters = useMemo(
    () => ({
      ...filters,
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      limit: itemLimit,
      type: SkuType.UNIQUE,
    }),
    [filters, selectedTeam, itemLimit]
  );

  return (
    <div
      className={`flex w-full gap-4 flex-col ${
        skuData.length === 0 ? "h-[calc(100vh-120px)]" : ""
      }`}
    >
      <div className="mt-4 flex-shrink-0">
        <ProductHeader
          showAllAttributes={showAllAttributes}
          onExportTemplate={() => setIsExportModalOpen(true)}
          onImportExcel={() => setIsImportModalOpen(true)}
          onToggleShowAllAttributes={setShowAllAttributes}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${
          skuData.length === 0 ? "overflow-visible" : "overflow-x-auto"
        }`}
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
            {!isLoadingProductData &&
              skuData.length > 0 &&
              skuData.map((item: SkuItemType, index: number) => (
                <ProductItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemLimit + index + 1 - itemLimit}
                  showAllAttributes={showAllAttributes}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingProductData ? (
          <SkeletonTable columns={8} />
        ) : (
          skuData.length === 0 && (
            <EmptyState
              action={
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/product/create")}
                >
                  {t("product:modal.addProduct.addButton", {
                    defaultValue: t("sku:modal.addSku.addButton"),
                  })}
                </Button>
              }
              className="mt-4"
              description={t("product:empty.description", {
                defaultValue: t("sku:empty.description"),
              })}
              title={t("product:empty.title", {
                defaultValue: t("sku:empty.title"),
              })}
            />
          )
        )}
      </div>

      <SkuTemplateExportModal
        defaultSkuType={SkuType.UNIQUE}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <SkuImportModal
        autoCloseOnSuccess
        allowedSkuTypes={[SkuType.UNIQUE]}
        isOpen={isImportModalOpen}
        queryContextOverride={{
          filters: importFilters,
        }}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default Product;
