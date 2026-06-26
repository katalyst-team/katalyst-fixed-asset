/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import { useShallow } from "zustand/react/shallow";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { useUser } from "@/context/user-context";
import useGetEdgeConfigDataQuery from "@/hooks/api/edge-config/useGetEdgeConfigDataQuery";

import EdgeConfigModal from "./EdgeConfigModal";
import { useEdgeConfigStore } from "../store/EdgeConfigStore";

const EdgeConfigHeader = () => {
  const { t } = useTranslation(["edge-config", "common"]);
  const { tokenPayload } = useUser();
  const {
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    itemLimit,
    setCurrentPage,
    setItemLimit,
    setTotalPages,
    totalPages,
  } = useEdgeConfigStore(
    useShallow((state) => ({
      currentPage: state.currentPage,
      filters: state.filters,
      goToNextPage: state.goToNextPage,
      goToPrevPage: state.goToPrevPage,
      itemLimit: state.itemLimit,
      setCurrentPage: state.setCurrentPage,
      setItemLimit: state.setItemLimit,
      setTotalPages: state.setTotalPages,
      totalPages: state.totalPages,
    }))
  );

  const { data: edgeConfigData } = useGetEdgeConfigDataQuery({
    filters: { ...filters, limit: itemLimit, page: currentPage },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  if (edgeConfigData?.pagination?.total_pages !== undefined) {
    setTotalPages(edgeConfigData.pagination.total_pages);
  }

  return (
    <div className="flex flex-col mt-4 lg:flex-row w-full justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold font-heading">
          {t("title", "Edge Configuration")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", "Manage edge device configurations")}
        </p>
        <EdgeConfigModal type="create" />
      </div>

      <div className="flex gap-2 items-center">
        <Select
          value={String(itemLimit)}
          onValueChange={(value) => {
            setItemLimit(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="1000">1000</SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          currentPage={currentPage}
          hasNextPage={currentPage < totalPages}
          hasPrevPage={currentPage > 1}
          limit={itemLimit}
          totalCount={edgeConfigData?.pagination?.total_count ?? undefined}
          totalPages={totalPages}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </div>
    </div>
  );
};

export default EdgeConfigHeader;
