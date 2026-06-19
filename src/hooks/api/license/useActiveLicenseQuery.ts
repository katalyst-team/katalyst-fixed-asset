import { useQuery } from "@tanstack/react-query";

import {
  GetActiveLicenseParams,
  getActiveLicenseService,
  LicenseApiResponse,
} from "@/services/license/getActiveLicenseService";

export const KEY_USE_GET_ACTIVE_LICENSE = (organizationId: string) => [
  "activeLicense",
  organizationId,
];

const useActiveLicenseQuery = ({
  organizationId,
}: GetActiveLicenseParams) => {
  return useQuery<LicenseApiResponse, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getActiveLicenseService({ organizationId }),
    queryKey: KEY_USE_GET_ACTIVE_LICENSE(organizationId),
    refetchInterval: 3600000,
    staleTime: 3600000,
  });
};

export { useActiveLicenseQuery };
