import {
  GetAgingStockAlertsParams,
  GetAgingStockAlertsResponse,
  GetCriticalStockAlertsParams,
  GetCriticalStockAlertsResponse,
  GetEpcMismatchesParams,
  GetEpcMismatchesResponse,
  GetPendingAuditsParams,
  GetPendingAuditsResponse,
} from "@/types/alert";

import fetcher, { ApiResponse } from "..";

export type {
  GetAgingStockAlertsParams,
  GetAgingStockAlertsResponse,
  GetCriticalStockAlertsParams,
  GetCriticalStockAlertsResponse,
  GetEpcMismatchesParams,
  GetEpcMismatchesResponse,
  GetPendingAuditsParams,
  GetPendingAuditsResponse,
};

export const getCriticalStockAlertsService = async ({
  organizationId,
}: GetCriticalStockAlertsParams): Promise<ApiResponse<GetCriticalStockAlertsResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/alerts/critical-stock`,
  });
};

export const getAgingStockAlertsService = async ({
  organizationId,
}: GetAgingStockAlertsParams): Promise<ApiResponse<GetAgingStockAlertsResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/alerts/aging-stock`,
  });
};

export const getEpcMismatchesService = async ({
  organizationId,
}: GetEpcMismatchesParams): Promise<ApiResponse<GetEpcMismatchesResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/alerts/epc-mismatches`,
  });
};

export const getPendingAuditsService = async ({
  organizationId,
}: GetPendingAuditsParams): Promise<ApiResponse<GetPendingAuditsResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/alerts/pending-audits`,
  });
};
