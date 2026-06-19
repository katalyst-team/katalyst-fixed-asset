/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import { useParams } from "next/navigation";
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

import DetailLedgerHistoryItem from "./DetailLedgerHistoryItem";
import DetailLedgerProductItem from "./DetailLedgerProductItem";
import { DetailLedgerProvider, useDetailLedger } from "./useDetailLedger";

const DetailLedgerContent = () => {
  const { t } = useTranslation("ledger");
  const {
    productData,
    historyData,
    isLoading,
    productCurrentPage,
    historyCurrentPage,
    productItemsPerPage,
    historyItemsPerPage,
    productTotalItems,
    historyTotalItems,
    setProductCurrentPage,
    setHistoryCurrentPage,
  } = useDetailLedger();

  const productTableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.productName"),
      t("table.header.quantity"),
      t("table.header.status"),
    ],
    [t]
  );

  const historyTableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.status"),
      t("table.header.lastUpdated"),
      t("table.header.operator"),
    ],
    [t]
  );

  const totalProductPages = Math.ceil(productTotalItems / productItemsPerPage);
  const totalHistoryPages = Math.ceil(historyTotalItems / historyItemsPerPage);

  const handleProductPageChange = (page: number) => {
    setProductCurrentPage(page);
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryCurrentPage(page);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (productData.length === 0) {
    return (
      <EmptyState
        description={t("detailEmpty.description")}
        title={t("detailEmpty.title")}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4">
      {/* Tabel Ledger Product */}
      <div className="w-full flex gap-4 flex-col lg:w-1/2">
        <h3 className="text-lg font-bold font-heading">{t("detail.productTable")}</h3>
        <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {productTableHeader.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productData.map((item) => (
                <DetailLedgerProductItem key={item.no} item={item} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-row flex-1 justify-end items-end w-full">
          <Pagination
            currentPage={productCurrentPage}
            totalPages={totalProductPages}
            onPageChange={handleProductPageChange}
          />
        </div>
      </div>

      {/* Tabel Ledger History */}
      <div className="w-full flex gap-4 flex-col lg:w-1/2">
        <h3 className="text-lg font-bold font-heading">{t("detail.historyTable")}</h3>
        <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {historyTableHeader.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((item) => (
                <DetailLedgerHistoryItem key={item.no} item={item} />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-row flex-1 justify-end items-end w-full">
          <Pagination
            currentPage={historyCurrentPage}
            totalPages={totalHistoryPages}
            onPageChange={handleHistoryPageChange}
          />
        </div>
      </div>
    </div>
  );
};

const DetailLedger = () => {
  const params = useParams();
  const organizationId = params?.organizationId as string;
  const storeId = params?.storeId as string;
  const itemId = params?.itemId as string;

  return (
    <DetailLedgerProvider
      itemId={itemId}
      organizationId={organizationId}
      storeId={storeId}
    >
      <DetailLedgerContent />
    </DetailLedgerProvider>
  );
};

export default DetailLedger;
