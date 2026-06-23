import { useQuery } from "@tanstack/react-query";

import {
  GetCamerasResponse,
  getCamerasService,
} from "@/services/fixed-assets/getCamerasService";

interface UseGetCamerasQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_CAMERAS = (organizationId: string) => [
  "faCameras",
  organizationId,
];

const useGetCamerasQuery = ({
  enabled = true,
  organizationId,
}: UseGetCamerasQueryParams) => {
  return useQuery<GetCamerasResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getCamerasService({ organizationId }),
    queryKey: KEY_USE_GET_FA_CAMERAS(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetCamerasQuery;
