import type { FaExportRequest, FaExportResponse } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type ExportDataResponse = ApiResponse<FaExportResponse>;

interface ExportDataParams {
  data: FaExportRequest;
  organizationId: string;
}

export const exportDataService = async ({
  data,
  organizationId,
}: ExportDataParams): Promise<ExportDataResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/exports`,
  });
};
