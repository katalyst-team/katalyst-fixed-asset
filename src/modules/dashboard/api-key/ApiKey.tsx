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
import { ApiKeyItemType } from "@/types/api-key";

import ApiKeyCreateDialog from "./ApiKeyCreateDialog";
import ApiKeyItem from "./ApiKeyItem";
import { useApiKey } from "./useApiKey";

const ApiKey = () => {
  const { t } = useTranslation(["api-key"]);
  const {
    apiKeyData,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    setCurrentPage,
  } = useApiKey();

  const tableHeader = useMemo(
    () => [
      t("api-key:table.header.no"),
      t("api-key:table.header.key"),
      t("api-key:table.header.status"),
      t("api-key:table.header.action"),
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
    <div className="flex w-full gap-6 flex-col">
      <div className="flex flex-col mt-4 lg:flex-row w-full justify-between">
        <div className=" flex-col lg:flex-row">
          <ApiKeyCreateDialog />
        </div>
      </div>
      {apiKeyData.length === 0 ? (
        <EmptyState
          action={<ApiKeyCreateDialog />}
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
                {apiKeyData.map((item: ApiKeyItemType, index: number) => (
                  <ApiKeyItem
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
  );
};

export default ApiKey;
