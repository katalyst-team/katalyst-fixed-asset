import { useQuery } from "@tanstack/react-query";

import {
  GetRfidReadersResponse,
  getRfidReadersService,
} from "@/services/fixed-assets/getRfidReadersService";

interface UseGetRfidReadersQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_RFID_READERS = (organizationId: string) => [
  "faRfidReaders",
  organizationId,
];

const useGetRfidReadersQuery = ({
  enabled = true,
  organizationId,
}: UseGetRfidReadersQueryParams) => {
  return useQuery<GetRfidReadersResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getRfidReadersService({ organizationId }),
    queryKey: KEY_USE_GET_FA_RFID_READERS(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetRfidReadersQuery;
