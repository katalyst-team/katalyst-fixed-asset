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
import { EdgeConfigItemType } from "@/types/edge-config";

import { EdgeConfigHeader, EdgeConfigItem, EdgeConfigModal } from "./components";
import { useEdgeConfigStore } from "./store/EdgeConfigStore";
import { useEdgeConfig } from "./useEdgeConfig";

const EdgeConfig = () => {
  const { t } = useTranslation(["edge-config"]);
  const { edgeConfigData, isLoadingEdgeConfigData } = useEdgeConfig();
  const currentPage = useEdgeConfigStore((state) => state.currentPage);
  const itemsPerPage = useEdgeConfigStore((state) => state.itemLimit);

  const tableHeader = useMemo(
    () => [
      t("table.header.no"),
      t("table.header.name"),
      t("table.header.store"),
      t("table.header.antenna"),
      t("table.header.deviceId"),
      t("table.header.currentStockMovementType"),
      t("table.header.nextStockMovementType"),
      t("table.header.rfidTagStatus"),
      t("table.header.operatorAor"),
      t("table.header.parentCategories"),
      t("table.header.actions"),
    ],
    [t]
  );

  return (
    <div
      className={`flex w-full gap-6 flex-col ${edgeConfigData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex-shrink-0">
        <EdgeConfigHeader />
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${edgeConfigData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
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
            {!isLoadingEdgeConfigData &&
              edgeConfigData.length > 0 &&
              edgeConfigData.map((item: EdgeConfigItemType, index: number) => (
                <EdgeConfigItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingEdgeConfigData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          edgeConfigData.length === 0 && (
            <EmptyState
              action={<EdgeConfigModal type="create" />}
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

export default EdgeConfig;
export { EdgeConfig };
