"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RfidItemType } from "@/types/rfid";

import EpcHeader from "./EpcHeader";
import EpcItem from "./EpcItem";
import EpcModalAdd from "./EpcModalAdd";
import { useEpcStore } from "./store";
import { useEpc } from "./useEpc";

const Epc = () => {
  const { t } = useTranslation(["epc"]);
  const { epcData, isLoadingEpcData, nextCursor, prevCursor, totalCount } = useEpc();
  const currentPage = useEpcStore((state) => state.currentPage);
  const itemsPerPage = useEpcStore((state) => state.itemLimit);

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.name"),
      t("table.header.epcCode"),
      t("table.header.barcode"),
      t("table.header.type"),
      t("table.header.category"),
      t("table.header.status"),
      t("table.header.isUsed"),
      t("table.header.cycleCount"),
      t("table.header.store"),
      t("table.header.createdDate"),
      t("table.header.actions"),
    ],
    [t]
  );

  return (
    <div
      className={`flex w-full gap-4 flex-col ${epcData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex-shrink-0">
        <EpcHeader
          nextCursor={nextCursor}
          prevCursor={prevCursor}
          totalCount={totalCount}
        />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${epcData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
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
            {!isLoadingEpcData &&
              epcData.length > 0 &&
              epcData.map((item: RfidItemType, index: number) => (
                <EpcItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingEpcData ? (
          <SkeletonTable columns={12} />
        ) : (
          epcData.length === 0 && (
            <EmptyState
              action={<EpcModalAdd type="create" />}
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

export default Epc;
