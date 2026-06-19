import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  GetAgingStockAlertsParams,
  GetAgingStockAlertsResponse,
  getAgingStockAlertsService,
  GetCriticalStockAlertsParams,
  GetCriticalStockAlertsResponse,
  getCriticalStockAlertsService,
  GetEpcMismatchesParams,
  GetEpcMismatchesResponse,
  getEpcMismatchesService,
  GetPendingAuditsParams,
  GetPendingAuditsResponse,
  getPendingAuditsService,
} from "@/services/alert/getAlertsService";

export const KEY_USE_GET_CRITICAL_STOCK_ALERTS = (organizationId: string) => [
  "criticalStockAlerts",
  organizationId,
];

const useGetCriticalStockAlertsQuery = ({
  organizationId,
}: GetCriticalStockAlertsParams) => {
  return useQuery<ApiResponse<GetCriticalStockAlertsResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getCriticalStockAlertsService({ organizationId }),
    queryKey: KEY_USE_GET_CRITICAL_STOCK_ALERTS(organizationId),
    refetchInterval: 120000,
    staleTime: 120000,
  });
};

export const KEY_USE_GET_AGING_STOCK_ALERTS = (organizationId: string) => [
  "agingStockAlerts",
  organizationId,
];

const useGetAgingStockAlertsQuery = ({
  organizationId,
}: GetAgingStockAlertsParams) => {
  return useQuery<ApiResponse<GetAgingStockAlertsResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getAgingStockAlertsService({ organizationId }),
    queryKey: KEY_USE_GET_AGING_STOCK_ALERTS(organizationId),
    refetchInterval: 300000,
    staleTime: 300000,
  });
};

export const KEY_USE_GET_EPC_MISMATCHES = (organizationId: string) => [
  "epcMismatches",
  organizationId,
];

const useGetEpcMismatchesQuery = ({
  organizationId,
}: GetEpcMismatchesParams) => {
  return useQuery<ApiResponse<GetEpcMismatchesResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getEpcMismatchesService({ organizationId }),
    queryKey: KEY_USE_GET_EPC_MISMATCHES(organizationId),
    refetchInterval: 180000,
    staleTime: 180000,
  });
};

export const KEY_USE_GET_PENDING_AUDITS = (organizationId: string) => [
  "pendingAudits",
  organizationId,
];

const useGetPendingAuditsQuery = ({
  organizationId,
}: GetPendingAuditsParams) => {
  return useQuery<ApiResponse<GetPendingAuditsResponse>, Error>({
    enabled: Boolean(organizationId),
    queryFn: () => getPendingAuditsService({ organizationId }),
    queryKey: KEY_USE_GET_PENDING_AUDITS(organizationId),
    refetchInterval: 300000,
    staleTime: 300000,
  });
};

export {
  useGetAgingStockAlertsQuery,
  useGetCriticalStockAlertsQuery,
  useGetEpcMismatchesQuery,
  useGetPendingAuditsQuery,
};
