"use client";

import { format } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import BadgeStatus from "@/components/shared/BadgeStatus";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { RfidHistoryItem } from "@/types/rfid";

import { useEpcDetail } from "./useEpcDetail";

interface MovementItemProps {
  item: RfidHistoryItem;
  index: number;
  currentPage: number;
  itemsPerPage: number;
}

const formatEnumValue = (value?: string) => {
  if (!value) {
    return "";
  }
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const MovementItem: React.FC<MovementItemProps> = ({
  item,
  index,
  currentPage,
  itemsPerPage,
}) => {
  const { t } = useTranslation(["detail-inventory", "epc"]);
  const formattedDate = item.created_at
    ? format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss")
    : t("detail-inventory:notAvailable");
  const eventLabel =
    formatEnumValue(item.event_type) || t("detail-inventory:notAvailable");
  const storeName = item.store?.name || t("detail-inventory:notAvailable");
  const subStoreName = item.sub_store?.name;
  const operatorName =
    item.operator?.name || t("detail-inventory:notAvailable");
  const stockMovementType = item.stock_movement?.type
    ? formatEnumValue(item.stock_movement.type)
    : t("detail-inventory:notAvailable");
  const stockMovementDirection = item.stock_movement?.direction
    ? formatEnumValue(item.stock_movement.direction)
    : undefined;
  const itemsSummary =
    item.items
      ?.map((historyItem) => {
        const skuName =
          historyItem.sku_name || t("detail-inventory:notAvailable");
        const quantity =
          historyItem.quantity !== undefined
            ? `x${historyItem.quantity}`
            : t("detail-inventory:notAvailable");
        return `${skuName} (${quantity})`;
      })
      .join(", ") || t("detail-inventory:notAvailable");
  const derivedStatus = (() => {
    const direction = item.stock_movement?.direction
      ?.toUpperCase()
      .replace(/\s+/g, "_");
    if (direction === "OUTBOUND") return "SUCCESS_OUTBOUND";
    if (direction === "INBOUND") return "SUCCESS_INBOUND";
    if (direction === "LEDGER") return "WAITING_INBOUND";
    return item.event_type;
  })();

  return (
    <TableRow>
      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>
        <div className="font-medium">{eventLabel}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium break-words">{itemsSummary}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{stockMovementType}</div>
        <div className="text-xs text-muted-foreground">
          {stockMovementDirection
            ? `${t("epc:detail.historyTable.labels.direction")}: ${stockMovementDirection}`
            : null}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{storeName}</div>
        {subStoreName ? (
          <div className="text-xs text-muted-foreground">
            {t("epc:detail.historyTable.labels.subStore")}: {subStoreName}
          </div>
        ) : null}
      </TableCell>
      <TableCell>
        <div className="font-medium">{operatorName}</div>
      </TableCell>
      <TableCell>
        {(() => {
          const normalizedStatus = derivedStatus
            ?.toUpperCase()
            .replace(/\s+/g, "_");
          if (normalizedStatus) {
            return <BadgeStatus status={normalizedStatus} />;
          }
          return t("detail-inventory:notAvailable");
        })()}
      </TableCell>
      <TableCell>{item.note || t("detail-inventory:notAvailable")}</TableCell>
      <TableCell>
        {(() => {
          const sm = item.stock_movement;
          const direction = sm?.direction?.toUpperCase();
          let url = null;

          if (sm?.id) {
            if (direction === "INBOUND") {
              url = `/dashboard/inbound/${sm.id}`;
            } else if (direction === "OUTBOUND") {
              url = `/dashboard/outbound/${sm.id}`;
            } else if (direction === "LEDGER") {
              url = `/dashboard/ledger-v2/${sm.id}`;
            }
          }

          if (url) {
            return (
              <Button asChild size="icon" variant="ghost">
                <Link href={url}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            );
          }
          return null;
        })()}
      </TableCell>
    </TableRow>
  );
};

const EpcDetailMovements = () => {
  const { t } = useTranslation(["epc", "detail-inventory"]);
  const {
    currentPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    histories,
    isHistoryLoading,
    itemsPerPage,
    setItemsPerPage,
    totalHistories,
  } = useEpcDetail();

  const tableHeader = [
    t("epc:detail.historyTable.header.no"),
    t("epc:detail.historyTable.header.timestamp"),
    t("epc:detail.historyTable.header.event"),
    t("epc:detail.historyTable.header.sku", "Items"),
    t("epc:detail.historyTable.header.stockMovement"),
    t("epc:detail.historyTable.header.store"),
    t("epc:detail.historyTable.header.operator"),
    t("epc:detail.historyTable.header.status"),
    t("epc:detail.historyTable.header.note"),
    t("epc:detail.historyTable.header.actions"),
  ];

  if (isHistoryLoading) {
    return <div className="w-full p-8 text-center">{t("epc:loading")}</div>;
  }

  return (
    <div className="my-6">
      <div className="flex flex-col gap-2 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold font-heading">
          {t("detail.movements")} ({totalHistories} total)
        </h2>
        <div className="flex items-center gap-2">
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue
                placeholder={t("pagination.itemsPerPage", { ns: "epc" })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          {(hasNextPage || hasPrevPage) && (
            <PaginationCursor
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onNext={goToNextPage}
              onPrev={goToPrevPage}
            />
          )}
        </div>
      </div>

      {histories.length === 0 ? (
        <div className="w-full p-8 text-center border rounded-md">
          {t("detail-inventory:noItemsFound")}
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <Table className="border shadow-md rounded-md">
              <TableHeader>
                <TableRow>
                  {tableHeader.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.map((item: RfidHistoryItem, index: number) => (
                  <MovementItem
                    key={item.id}
                    currentPage={currentPage}
                    index={index}
                    item={item}
                    itemsPerPage={itemsPerPage}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {(hasNextPage || hasPrevPage) && (
            <div className="flex flex-row flex-1 justify-end items-end w-full mt-4">
              <PaginationCursor
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onNext={goToNextPage}
                onPrev={goToPrevPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EpcDetailMovements;
