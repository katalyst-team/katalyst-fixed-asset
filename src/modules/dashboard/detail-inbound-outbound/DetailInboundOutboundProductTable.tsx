import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import Pagination from "@/components/shared/Pagination";
import TableExportButton from "@/components/shared/TableExportButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockMovementProductItemType } from "@/types/stockMovementDetail";
import { convertToTitleCase } from "@/utils/text";

import DetailInboundOutboundProductItem from "./DetailInboundOutboundProductItem";
import { useDetailInboundOutbound } from "./useDetailInboundOutbound";

interface DetailInboundOutboundProductTableProps {
  productData: StockMovementProductItemType[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const DetailInboundOutboundProductTable: React.FC<
  DetailInboundOutboundProductTableProps
> = ({ productData, currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const { t } = useTranslation("detail-inbound-outbound");
  const { t: commonT } = useTranslation("common");
  const { allProductData } = useDetailInboundOutbound();

  const productTableHeader = useMemo(
    () => [
      t("productTable.header.no"),
      t("productTable.header.productName"),
      t("productTable.header.category"),
      t("productTable.header.quantity"),
      t("productTable.header.lastStatus"),
      t("productTable.header.action"),
    ],
    [t]
  );

  // Export columns configuration (excluding action column)
  const exportColumns = useMemo(
    () => [
      { key: "no", label: t("productTable.header.no") },
      { key: "productName", label: t("productTable.header.productName") },
      {
        formatter: (category: unknown) => {
          return commonT(String(category || "").toLowerCase());
        },
        key: "category",
        label: t("productTable.header.category"),
      },
      { key: "quantity", label: t("productTable.header.quantity") },
      {
        formatter: (status: unknown) => {
          return convertToTitleCase(String(status || ""));
        },
        key: "lastStatus",
        label: t("productTable.header.lastStatus"),
      },
    ],
    [t, commonT]
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="w-full flex gap-4 flex-col">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-bold">{t("productList")}</h2>
        <TableExportButton
          columns={exportColumns}
          data={allProductData}
          filename="product_list"
        />
      </div>
      <Table className="border shadow-md rounded-md">
        <TableHeader>
          <TableRow>
            {productTableHeader.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productData.length > 0 ? (
            productData.map((item) => (
              <DetailInboundOutboundProductItem key={item.no} item={item} />
            ))
          ) : (
            <TableRow>
              <TableCell
                className="text-center py-4"
                colSpan={productTableHeader.length}
              >
                {t("noProductData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-row flex-1 justify-end items-end w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default DetailInboundOutboundProductTable;
