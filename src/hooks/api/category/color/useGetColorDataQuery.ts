import { useQuery } from "@tanstack/react-query";

import {
  GetColorDataResponse,
  getColorDataService,
} from "@/services/category/color/getColorDataService";

interface UseGetColorDataQueryParams {
  organizationId: string;
}
export const KEY_USE_GET_COLOR_DATA_QUERY = (organizationId: string) => [
  "colorData",
  organizationId,
];

const useGetColorDataQuery = ({
  organizationId,
}: UseGetColorDataQueryParams) => {
  return useQuery<GetColorDataResponse, Error>({
    queryFn: () => getColorDataService(organizationId),
    queryKey: KEY_USE_GET_COLOR_DATA_QUERY(organizationId),
    staleTime: 60 * 1000, // 60 seconds
  });
};

export default useGetColorDataQuery;
