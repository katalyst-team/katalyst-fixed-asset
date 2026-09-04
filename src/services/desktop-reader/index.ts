import axios from "axios";

import type {
  DesktopReaderStatusResponse,
  ScanRfidsResponse,
} from "@/types/desktop-reader";

const request = async <T>(url: string): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL_DESKTOP_READER;

  if (!baseURL) {
    throw new Error("Desktop reader API URL not configured");
  }

  const response = await axios({
    baseURL,
    headers: { "ngrok-skip-browser-warning": "true" },
    method: "GET",
    url,
  });

  return response.data as T;
};

export const getDesktopReaderStatusService = () =>
  request<DesktopReaderStatusResponse>("/api/status");

export const scanRfidsService = () => request<ScanRfidsResponse>("/api/read-epc");
