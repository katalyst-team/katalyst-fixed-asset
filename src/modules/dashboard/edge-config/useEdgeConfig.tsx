import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetEdgeConfigDataQuery from "@/hooks/api/edge-config/useGetEdgeConfigDataQuery";
import type { ApiResponse } from "@/services";
import { EdgeConfigItemType, EdgeConfigResponse } from "@/types/edge-config";

import { useEdgeConfigStore } from "./store/EdgeConfigStore";

interface UseEdgeConfigResult {
  edgeConfigData: EdgeConfigItemType[];
  isLoadingEdgeConfigData: boolean;
  pagination: ApiResponse<EdgeConfigResponse>["pagination"] | null;
}

export const useEdgeConfig = (): UseEdgeConfigResult => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { filters, itemLimit, nextCursor, prevCursor } =
    useEdgeConfigStore(
      useShallow((state) => ({
        filters: state.filters,
        itemLimit: state.itemLimit,
        nextCursor: state.nextCursor,
        prevCursor: state.prevCursor,
      }))
    );

  const queryFilters = {
    ...filters,
    cursor: nextCursor ?? prevCursor ?? undefined,
    limit: itemLimit,
  };

  const { data, isLoading } = useGetEdgeConfigDataQuery({
    filters: queryFilters,
    organizationId,
  });

  const edgeConfigData = data?.data?.configs ?? [];
  const pagination = data?.pagination ?? null;

  return {
    edgeConfigData,
    isLoadingEdgeConfigData: isLoading,
    pagination,
  };
};

export default useEdgeConfig;
