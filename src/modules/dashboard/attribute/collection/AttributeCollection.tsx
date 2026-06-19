"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import Pagination from "@/components/shared/Pagination";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { AttributeCollectionItemType } from "@/types/attributeCollection";

import AttributeCollectionItem from "./AttributeCollectionItem";
import AttributeCollectionModalAdd from "./AttributeCollectionModalAdd";
import {
  AttributeCollectionProvider,
  useAttributeCollection,
} from "./useAttributeCollection";

const AttributeCollection = () => {
  const { t } = useTranslation(["attribute-collection"]);
  const { tokenPayload } = useUser();
  const {
    attributeCollections,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    storeId,
    setStoreId,
  } = useAttributeCollection();

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = storeData?.data?.stores ?? [];

  const handleStoreChange = (value: string) => {
    setStoreId(value !== "all" ? value : undefined);
    setCurrentPage(1);
  };

  const tableHeader = useMemo(
    () => [
      t("attribute-collection:table.header.no"),
      t("attribute-collection:table.header.name"),
      t("attribute-collection:table.header.description"),
      t("attribute-collection:table.header.attributes"),
      t("attribute-collection:table.header.action"),
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
    <AttributeCollectionProvider>
      <div className="flex w-full gap-4 flex-col">
        <div className="flex flex-col mt-4 lg:flex-row w-full justify-between">
          <div className="flex flex-col lg:flex-row gap-2">
            <AttributeCollectionModalAdd type="create" />
            <Select value={storeId ?? "all"} onValueChange={handleStoreChange}>
              <SelectTrigger className="lg:max-w-[200px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {attributeCollections.length === 0 ? (
          <EmptyState
            action={<AttributeCollectionModalAdd type="create" />}
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
                  {attributeCollections.map(
                    (item: AttributeCollectionItemType, index: number) => (
                      <AttributeCollectionItem
                        key={item.id}
                        item={item}
                        num={
                          currentPage * itemsPerPage + index + 1 - itemsPerPage
                        }
                      />
                    )
                  )}
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
    </AttributeCollectionProvider>
  );
};

export default AttributeCollection;
