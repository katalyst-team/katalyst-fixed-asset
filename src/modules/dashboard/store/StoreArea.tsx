"use client";

import { useParams } from "next/navigation";
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
import { StoreAreaItemType } from "@/types/store";

import StoreAreaItem from "./StoreAreaItem";
import StoreAreaModalAdd from "./StoreAreaModalAdd";
import { StoreAreaProvider, useStoreArea } from "./useStoreArea";

const StoreAreaContent = () => {
  const { t } = useTranslation("store");
  const {
    storeAreaData,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    storeId,
  } = useStoreArea();

  const tableHeader = useMemo(() => ["No", "Area", "Action"], []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full gap-6 flex-col">
      <div className="flex flex-col mt-4 lg:flex-row w-full justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <StoreAreaModalAdd areaId="" storeId={storeId} type="create" />
        </div>
      </div>
      {storeAreaData.length === 0 ? (
        <EmptyState
          action={
            <StoreAreaModalAdd areaId="" storeId={storeId} type="create" />
          }
          description={t("areaEmpty.description")}
          title={t("areaEmpty.title")}
        />
      ) : (
        <>
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {tableHeader.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeAreaData.map((item: StoreAreaItemType, index: number) => (
                <StoreAreaItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                  storeId={storeId}
                />
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-row flex-1 justify-end items-end w-full">
            <PaginationCursor
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              limit={itemsPerPage}
              totalCount={totalItems}
              onNext={onNextPage}
              onPrev={onPrevPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

const StoreArea = () => {
  const params = useParams();
  const storeId = (params?.storeId as string) || "";

  if (!storeId) {
    return <Loading />;
  }

  return (
    <StoreAreaProvider storeId={storeId}>
      <StoreAreaContent />
    </StoreAreaProvider>
  );
};

export default StoreArea;
