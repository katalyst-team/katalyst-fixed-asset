import { useQuery } from "@tanstack/react-query";

import {
  GetFASettingsResponse,
  getFASettingsService,
} from "@/services/fixed-assets/getFASettingsService";

interface UseGetFASettingsQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_SETTINGS = (organizationId: string) => [
  "faSettings",
  organizationId,
];

const useGetFASettingsQuery = ({
  enabled = true,
  organizationId,
}: UseGetFASettingsQueryParams) => {
  return useQuery<GetFASettingsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFASettingsService({ organizationId }),
    queryKey: KEY_USE_GET_FA_SETTINGS(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetFASettingsQuery;
