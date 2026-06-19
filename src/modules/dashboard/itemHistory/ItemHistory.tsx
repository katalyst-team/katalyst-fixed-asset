"use client";

import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import Pagination from "@/components/shared/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DetailInventorySkuInfo from "@/modules/dashboard/detailInventory/DetailInventorySkuInfo";
import { formatDateTime } from "@/utils/text";
import { convertToTitleCase } from "@/utils/text";

import ItemHistoryRow from "./ItemHistoryRow";
import { useItemHistory } from "./useItemHistory";

const ItemHistory = () => {
  const { t } = useTranslation("detail-inventory");
  const { t: itemT } = useTranslation("item-history");
  const {
    itemData,
    historyData,
    skuData,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    setCurrentPage,
  } = useItemHistory();

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.status"),
      "Type",
      "Store",
      t("table.header.section"),
      "Qty",
      "Note",
      t("table.header.lastUpdate"),
      t("table.header.operator"),
      "Actions",
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
      {/* Item Info Card */}
      {/* Item Info Card */}
      {itemData && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold font-heading">
              {itemT("itemInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  {itemT("epc")}
                </span>
                <p className="font-mono text-sm font-medium mt-1">
                  {itemData.rfid_detail?.id ? (
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/dashboard/epc/${itemData.rfid_detail.id}`}
                    >
                      {itemData.epc || "-"}
                    </Link>
                  ) : (
                    itemData.epc || "-"
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  {itemT("currentStatus")}
                </span>
                <p className="text-sm font-medium mt-1">
                  {itemData.status?.name
                    ? convertToTitleCase(itemData.status.name)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Store
                </span>
                <p className="text-sm font-medium mt-1">
                  {itemData.store?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Section
                </span>
                <p className="text-sm font-medium mt-1">
                  {itemData.section?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Expiry Date
                </span>
                <p className="text-sm font-medium mt-1">
                  {itemData.expiry_date
                    ? new Date(itemData.expiry_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  {itemT("createdAt")}
                </span>
                <p className="text-sm font-medium mt-1">
                  {itemData.created_at
                    ? formatDateTime(itemData.created_at)
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SKU Info */}
      <DetailInventorySkuInfo skuData={skuData} />

      {/* Status History */}
      {historyData.length === 0 ? (
        <EmptyState
          description={itemT("historyEmpty.description")}
          title={itemT("historyEmpty.title")}
        />
      ) : (
        <>
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold font-heading">
                {itemT("statusHistory")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
                <Table className="border rounded-md">
                  <TableHeader>
                    <TableRow>
                      {tableHeader.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((item) => (
                      <ItemHistoryRow key={item.no} item={item} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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

export default ItemHistory;
