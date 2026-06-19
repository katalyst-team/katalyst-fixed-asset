import {
  GetActiveLicenseParams,
  GetActiveLicenseResponse,
  LicenseData,
} from "@/types/license";

import fetcher from "..";

export type {
  GetActiveLicenseParams,
  GetActiveLicenseResponse,
  LicenseData,
};

export type LicenseApiResponse = {
  data: LicenseData;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
};

export const getActiveLicenseService = async ({
  organizationId,
}: GetActiveLicenseParams): Promise<LicenseApiResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/public/licenses/organizations/${organizationId}/active`,
  });
};
