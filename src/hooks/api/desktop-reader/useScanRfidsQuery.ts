import { useQuery } from "@tanstack/react-query";

import {
  scanRfidsService,
} from "@/services/desktop-reader/scanRfidsService";
import { ScanRfidsResponse } from "@/types/desktop-reader";

export const KEY_USE_SCAN_RFIDS = () => ["scanRfids"];

const useScanRfidsQuery = () => {
  return useQuery<ScanRfidsResponse, Error>({
    enabled: false,
    gcTime: 0, // Don't cache at all (renamed from cacheTime)
    queryFn: () => scanRfidsService(),
    queryKey: KEY_USE_SCAN_RFIDS(),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0,
  });
};

export default useScanRfidsQuery;