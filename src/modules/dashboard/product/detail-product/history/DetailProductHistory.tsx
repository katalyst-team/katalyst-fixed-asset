"use client";

import { useTranslation } from "next-i18next";
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
import DetailInventorySkuInfo from "@/modules/dashboard/detailInventory/DetailInventorySkuInfo";

import DetailProductHistoryItem from "./DetailProductHistoryItem";
import { useDetailProductHistory } from "./useDetailProductHistory";

const DetailProductHistoryPage = () => {
  const { t } = useTranslation("detail-inventory");
  const {
    detailSkuProductHistoryData,
    skuData,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    setCurrentPage,
  } = useDetailProductHistory();

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.status"),
      t("table.header.lastUpdate"),
      t("table.header.operator"),
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

  return (
    <div className="flex w-full gap-4 flex-col">
      <DetailInventorySkuInfo skuData={skuData} />
      {detailSkuProductHistoryData.length === 0 ? (
        <EmptyState
          description={t("historyEmpty.description")}
          title={t("historyEmpty.title")}
        />
      ) : (
        <>
          <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
            <Table className="border shadow-md rounded-md">
              <TableHeader>
                <TableRow>
                  {tableHeader.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailSkuProductHistoryData.map((item) => (
                  <DetailProductHistoryItem key={item.no} item={item} />
                ))}
              </TableBody>
            </Table>
          </div>
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

export default DetailProductHistoryPage;
