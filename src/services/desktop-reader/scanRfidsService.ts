import axios from "axios";

import { ScanRfidsResponse } from "@/types/desktop-reader";

export const scanRfidsService = async (): Promise<ScanRfidsResponse> => {
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
    url: "/api/read-epc",
  });

  return response.data;
};