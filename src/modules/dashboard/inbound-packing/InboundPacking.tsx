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

import InboundPackingHeader from "./InboundPackingHeader";
import InboundPackingItem from "./InboundPackingItem";
import { useInboundPacking } from "./useInboundPacking";

const InboundPacking = () => {
  const { t } = useTranslation("inbound-packing");
  const {
    inboundPackingData,
    setFilterOptions,
    isLoading,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    currentFilters,
  } = useInboundPacking();

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.status"),
      t("table.header.inboundPackingType"),
      t("table.header.inboundPackingDate"),
      t("table.header.inboundPackingQty"),
      t("table.header.storeArea"),
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
      <InboundPackingHeader
        currentFilters={currentFilters}
        onApplyFilters={setFilterOptions}
      />
      {inboundPackingData.length === 0 ? (
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
                {inboundPackingData.map((item, index) => (
                  <InboundPackingItem key={item.id} index={index} item={item} />
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

export default InboundPacking;
