"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import OutboundPackingHeader from "./OutboundPackingHeader";
import OutboundPackingItem from "./OutboundPackingItem";
import { useOutboundPacking } from "./useOutboundPacking";

const OutboundPacking = () => {
  const { t } = useTranslation("outbound-packing");
  const {
    outboundPackingData,
    setFilterOptions,
    isLoading,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    currentFilters,
  } = useOutboundPacking();

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.status"),
      t("table.header.outboundPackingType"),
      t("table.header.outboundPackingDate"),
      t("table.header.outboundPackingQty"),
      t("table.header.warehouse"),
      t("table.header.operator"),
      t("table.header.action"),
    ],
    [t]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full gap-4 flex-col">
      <OutboundPackingHeader
        currentFilters={currentFilters}
        onApplyFilters={setFilterOptions}
      />
      {outboundPackingData.length === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
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
                {outboundPackingData.map((item, index) => (
                  <OutboundPackingItem
                    key={item.id}
                    index={index}
                    item={item}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-row flex-1 justify-end items-end w-full">
            <PaginationCursor
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onNext={goToNextPage}
              onPrev={goToPrevPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default OutboundPacking;
