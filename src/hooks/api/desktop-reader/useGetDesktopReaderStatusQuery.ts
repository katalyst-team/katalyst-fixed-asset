import { useQuery } from "@tanstack/react-query";

import { getDesktopReaderStatusService } from "@/services/desktop-reader";
import type { DesktopReaderStatusResponse } from "@/types/desktop-reader";

export const KEY_USE_GET_DESKTOP_READER_STATUS = () => ["desktopReaderStatus"];

const useGetDesktopReaderStatusQuery = () =>
  useQuery<DesktopReaderStatusResponse, Error>({
    queryFn: getDesktopReaderStatusService,
    queryKey: KEY_USE_GET_DESKTOP_READER_STATUS(),
    retry: false,
  });

export default useGetDesktopReaderStatusQuery;
