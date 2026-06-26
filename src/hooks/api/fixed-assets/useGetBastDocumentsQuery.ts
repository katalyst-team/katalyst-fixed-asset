import { useQuery } from "@tanstack/react-query";

import {
  GetBastDocumentsResponse,
  getBastDocumentsService,
} from "@/services/fixed-assets/getBastDocumentsService";

interface UseGetBastDocumentsQueryParams {
  enabled?: boolean;
  organizationId: string;
  status?: string;
}

export const KEY_USE_GET_FA_BAST = (organizationId: string, status?: string) => [
  "faBast",
  organizationId,
  status,
];

const useGetBastDocumentsQuery = ({
  enabled = true,
  organizationId,
  status,
}: UseGetBastDocumentsQueryParams) => {
  return useQuery<GetBastDocumentsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getBastDocumentsService({ organizationId, status }),
    queryKey: KEY_USE_GET_FA_BAST(organizationId, status),
    staleTime: 60 * 1000,
  });
};

export default useGetBastDocumentsQuery;
