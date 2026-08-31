import { useQuery } from "@tanstack/react-query";

import {
  GetRfidTagOrdersResponse,
  getRfidTagOrdersService,
} from "@/services/fixed-assets/getRfidTagOrdersService";
import type { FaRfidTagOrderFilterOptions } from "@/types/fixed-assets";

interface UseGetRfidTagOrdersQueryParams extends FaRfidTagOrderFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_RFID_TAG_ORDERS = (
  organizationId: string,
  filters?: FaRfidTagOrderFilterOptions,
) => ["faRfidTagOrders", organizationId, JSON.stringify(filters ?? {})];

const useGetRfidTagOrdersQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  status,
}: UseGetRfidTagOrdersQueryParams) => {
  const filters: FaRfidTagOrderFilterOptions = {
    limit,
    page,
    status,
  };

  return useQuery<GetRfidTagOrdersResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getRfidTagOrdersService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_RFID_TAG_ORDERS(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetRfidTagOrdersQuery;
