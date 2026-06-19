import { useCallback } from "react";

import { scanRfidsService } from "@/services/desktop-reader/scanRfidsService";
import { ScanRfidsResponse } from "@/types/desktop-reader";

// Manual hook that bypasses React Query for real-time scanning
const useScanRfidsManual = () => {
  const scanRfids = useCallback(async (): Promise<ScanRfidsResponse> => {
    try {
      const result = await scanRfidsService();
      return result;
    } catch (error) {
      console.error("Scan error:", error);
      throw error;
    }
  }, []);

  return { scanRfids };
};

export default useScanRfidsManual;