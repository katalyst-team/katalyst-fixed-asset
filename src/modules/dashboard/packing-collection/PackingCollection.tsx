"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PackingCollectionItemType } from "@/types/packing-collection";

import PackingCollectionHeader from "./PackingCollectionHeader";
import PackingCollectionItem from "./PackingCollectionItem";
import PackingCollectionModalAdd from "./PackingCollectionModalAdd";
import { usePackingCollectionStore } from "./store";
import { usePackingCollection } from "./usePackingCollection";

const PackingCollection = () => {
  const { t } = useTranslation(["packing-collection"]);
  const { packingCollectionData, isLoadingPackingCollectionData } =
    usePackingCollection();

  // Use Zustand store - get primitive values
  const currentPage = usePackingCollectionStore((state) => state.currentPage);
  const itemsPerPage = usePackingCollectionStore((state) => state.itemLimit);

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.name"),
      t("table.header.description"),
      t("table.header.itemCount"),
      t("table.header.actions"),
    ],
    [t]
  );

  return (
    <div
      className={`flex w-full gap-4 flex-col ${packingCollectionData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex-shrink-0">
        <PackingCollectionHeader />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${packingCollectionData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
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
            {!isLoadingPackingCollectionData &&
              packingCollectionData.length > 0 &&
              packingCollectionData.map(
                (item: PackingCollectionItemType, index: number) => (
                  <PackingCollectionItem
                    key={item.id}
                    item={item}
                    num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                  />
                )
              )}
          </TableBody>
        </Table>

        {isLoadingPackingCollectionData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          packingCollectionData.length === 0 && (
            <EmptyState
              action={<PackingCollectionModalAdd type="create" />}
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

export default PackingCollection;
