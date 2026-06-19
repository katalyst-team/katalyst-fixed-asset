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
import { StoreItemType } from "@/types/store";

import StoreItem from "./StoreItem";
import StoreModalAddStore from "./StoreModalAddStore";
import { StoreProvider, useStore } from "./useStore";

const Store = () => {
  const { t } = useTranslation(["store"]);
  const {
    storeData,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    setCurrentPage,
  } = useStore();

  const tableHeader = useMemo(
    () => [
      t("store:table.header.no"),
      t("store:table.header.store"),
      t("store:table.header.address"),
      t("store:table.header.status"),
      t("store:table.header.action"),
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
    <StoreProvider>
      <div className="flex w-full gap-6 flex-col">
        <div className="flex flex-col mt-4 lg:flex-row w-full justify-between">
          <div className=" flex-col lg:flex-row">
            <StoreModalAddStore storeId="" type="create" />
          </div>
        </div>
        {storeData.length === 0 ? (
          <EmptyState
            action={<StoreModalAddStore storeId="" type="create" />}
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
                  {storeData.map((item: StoreItemType, index: number) => (
                    <StoreItem
                      key={item.id}
                      item={item}
                      num={currentPage * itemsPerPage + index + 1 - 5}
                    />
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
    </StoreProvider>
  );
};

export default Store;
