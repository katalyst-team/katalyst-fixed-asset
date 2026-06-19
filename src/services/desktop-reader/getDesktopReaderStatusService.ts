import axios from "axios";

import { DesktopReaderStatusResponse } from "@/types/desktop-reader";

export const getDesktopReaderStatusService = async (): Promise<DesktopReaderStatusResponse> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL_DESKTOP_READER;

  if (!baseURL) {
    throw new Error("Desktop reader API URL not configured");
  }

  const response = await axios({
    baseURL,
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    method: "GET",
    url: "/api/status",
  });

  return response.data as DesktopReaderStatusResponse;
};

export default getDesktopReaderStatusService;

