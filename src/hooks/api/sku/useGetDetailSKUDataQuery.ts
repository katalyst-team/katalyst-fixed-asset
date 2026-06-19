import { useQuery } from "@tanstack/react-query";

import { getDetailSkuDataService } from "@/services/sku/getDetailSkuService";
import { DetailSkuFilterOptions, DetailSkuItemType } from "@/types/detailSku";

interface UseGetDetailSkuDataQueryParams {
  filters?: DetailSkuFilterOptions;
  initialData?: DetailSkuItemType[];
}

const useGetDetailSkuDataQuery = ({
  filters,
  initialData,
}: UseGetDetailSkuDataQueryParams = {}) => {
  return useQuery<DetailSkuItemType[], Error>({
    initialData: initialData,
    queryFn: () => getDetailSkuDataService(filters),
    queryKey: ["detailSkuData", filters],
    staleTime: 60 * 1000, // 60 seconds
  });
};

export default useGetDetailSkuDataQuery;
