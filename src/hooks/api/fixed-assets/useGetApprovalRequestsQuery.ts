import { useQuery } from "@tanstack/react-query";

import {
  GetApprovalRequestsResponse,
  getApprovalRequestsService,
} from "@/services/fixed-assets/getApprovalRequestsService";

interface UseGetApprovalRequestsQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
  status?: string;
  type?: string;
}

export const KEY_USE_GET_FA_APPROVAL_REQUESTS = (
  organizationId: string,
  status?: string,
  type?: string,
) => ["faApprovalRequests", organizationId, status, type];

const useGetApprovalRequestsQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  status,
  type,
}: UseGetApprovalRequestsQueryParams) => {
  return useQuery<GetApprovalRequestsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getApprovalRequestsService({ limit, organizationId, page, status, type }),
    queryKey: KEY_USE_GET_FA_APPROVAL_REQUESTS(organizationId, status, type),
    staleTime: 30 * 1000,
  });
};

export default useGetApprovalRequestsQuery;
