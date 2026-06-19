import fetcher, { ApiResponse } from "@/services";
import { ReportData, ReportFilterOptions } from "@/types/report";

export interface GetReportDataParams {
  organizationId: string;
  storeId: string;
  filters?: ReportFilterOptions;
}

export type GetReportDataResponse = ApiResponse<ReportData>;

export const getReportDataService = async ({
  organizationId,
  storeId,
  filters,
}: GetReportDataParams): Promise<GetReportDataResponse> => {
  const params: Record<string, unknown> = {};

  if (filters?.category_id) {
    params.category_id = filters.category_id;
  }

  if (filters?.stock_movement_direction) {
    params.stock_movement_direction = filters.stock_movement_direction;
  }

  if (filters?.start_date) {
    params.start_date = filters.start_date;
  }

  if (filters?.end_date) {
    params.end_date = filters.end_date;
  }

  if (filters?.cursor) {
    params.cursor = filters.cursor;
  }

  if (filters?.limit) {
    params.limit = filters.limit;
  }

  const url = `/v1/organizations/${organizationId}/stores/${storeId}/reports`;

  return fetcher({
    method: "GET",
    params,
    url,
  });
};
