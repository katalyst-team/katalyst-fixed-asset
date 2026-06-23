import { useQuery } from "@tanstack/react-query";

import {
  GetInvoicesResponse,
  getInvoicesService,
} from "@/services/fixed-assets/getInvoicesService";

interface UseGetInvoicesQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_INVOICES = (organizationId: string) => [
  "faInvoices",
  organizationId,
];

const useGetInvoicesQuery = ({
  enabled = true,
  organizationId,
}: UseGetInvoicesQueryParams) => {
  return useQuery<GetInvoicesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getInvoicesService({ organizationId }),
    queryKey: KEY_USE_GET_FA_INVOICES(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetInvoicesQuery;
