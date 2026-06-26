import { useQuery } from "@tanstack/react-query";

import {
  GetApprovalRequestsResponse,
  getApprovalRequestsService,
} from "@/services/fixed-assets/getApprovalRequestsService";

interface UseGetApprovalRequestsQueryParams {
  cursor?: string;
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  status?: string;
  type?: string;
}

export const KEY_USE_GET_FA_APPROVAL_REQUESTS = (
  organizationId: string,
  status?: string,
  type?: string,
) => ["faApprovalRequests", organizationId, status, type];

const useGetApprovalRequestsQuery = ({
  cursor,
  enabled = true,
  limit,
  organizationId,
  status,
  type,
}: UseGetApprovalRequestsQueryParams) => {
  return useQuery<GetApprovalRequestsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getApprovalRequestsService({ cursor, limit, organizationId, status, type }),
    queryKey: KEY_USE_GET_FA_APPROVAL_REQUESTS(organizationId, status, type),
    staleTime: 30 * 1000,
  });
};

export default useGetApprovalRequestsQuery;
