/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import Pagination from "@/components/shared/Pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DetailProductItem from "./DetailProductItem";
import { useDetailProduct } from "./useDetailProduct";

const DetailProduct = () => {
  const { t } = useTranslation(["product", "sku"]);
  const {
    detailSkuData: detailProductData,
    isLoading,
    currentPage,
    listImages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
  } = useDetailProduct();

  const tableHeader = useMemo(
    () => [
      t("detail.table.header.no", {
        defaultValue: t("sku:table.header.no"),
      }),
      "EPC",
      t("detail.updatedAt"),
      t("detail.status"),
    ],
    [t]
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (detailProductData.length === 0) {
    return (
      <EmptyState
        description={t("detailEmpty.description")}
        title={t("detailEmpty.title")}
      />
    );
  }

  return (
    <div className="flex w-full gap-4 flex-col">
      <h1 className="text-2xl font-bold font-heading">
        {t("detail.title", {
          defaultValue: t("sku:detail.sku"),
        })}
      </h1>
      <section className="shadow-sm rounded-xl border border-border overflow-hidden">
        <h2 className="text-base font-semibold font-heading px-4 pt-4 pb-2 border-b border-border/50">
          {t("detail.info")}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeader.map((header) => (
                <TableHead
                  key={header}
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {detailProductData.map((item) => (
              <DetailProductItem key={item.no} item={item} />
            ))}
          </TableBody>
        </Table>
      </section>
      <section>
        <h2 className="text-base font-semibold font-heading mb-2">
          {t("detail.history")}
        </h2>
        <div className="flex flex-row flex-1 justify-end items-end w-full">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
      {listImages.length > 0 && (
        <div className="w-full shadow-sm rounded-xl border border-border p-4">
          <h2 className="text-base font-semibold font-heading mb-4">
            {t("detail.productImages", "Product Images")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {listImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-muted-foreground/50 transition-colors"
              >
                <Image
                  fill
                  alt={t("modal.addSku.imageAlt", {
                    defaultValue: `Product image ${index + 1}`,
                    index: index + 1,
                  })}
                  className="object-cover"
                  src={image}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProduct;
