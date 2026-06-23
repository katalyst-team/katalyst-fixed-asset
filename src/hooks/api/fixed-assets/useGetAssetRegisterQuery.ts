import { useQuery } from "@tanstack/react-query";

import {
  GetAssetRegisterResponse,
  getAssetRegisterService,
} from "@/services/fixed-assets/getAssetRegisterService";
import type { FaAssetFilterOptions } from "@/types/fixed-assets";

interface UseGetAssetRegisterQueryParams extends FaAssetFilterOptions {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_ASSET_REGISTER = (
  organizationId: string,
  filters?: FaAssetFilterOptions,
) => ["faAssetRegister", organizationId, JSON.stringify(filters ?? {})];

const useGetAssetRegisterQuery = ({
  cat,
  cursor,
  custodian,
  enabled = true,
  limit,
  loc,
  organizationId,
  q,
  status,
  store_id,
}: UseGetAssetRegisterQueryParams) => {
  const filters: FaAssetFilterOptions = {
    cat,
    cursor,
    custodian,
    limit,
    loc,
    q,
    status,
    store_id,
  };

  return useQuery<GetAssetRegisterResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getAssetRegisterService({ ...filters, organizationId }),
    queryKey: KEY_USE_GET_FA_ASSET_REGISTER(organizationId, filters),
    staleTime: 60 * 1000,
  });
};

export default useGetAssetRegisterQuery;
