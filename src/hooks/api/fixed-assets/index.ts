import { useQuery } from "@tanstack/react-query";

import {
  getAssetDetailService,
  getAssetRegisterService,
  getAuditService,
  getCheckOutService,
  getFADashboardService,
  getFAMasterDataService,
  getFAUsersService,
  getMaintenanceService,
  getReportsService,
  getRFIDTagsService,
  getScanOutService,
  getSecurityService,
  getTransferService,
} from "@/services/fixed-assets";

export const KEY_USE_GET_FA_DASHBOARD = (orgId: string) => ["faDashboard", orgId];

const useGetFADashboardQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getFADashboardService(organizationId),
    queryKey: [...KEY_USE_GET_FA_DASHBOARD(organizationId)],
    staleTime: 60_000,
  });
};

export default useGetFADashboardQuery;

export const useGetAssetRegisterQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getAssetRegisterService(organizationId),
    queryKey: ["faRegister", organizationId],
    staleTime: 60_000,
  });
};

export const useGetAssetDetailQuery = (
  organizationId: string,
  assetId: string,
) => {
  return useQuery({
    enabled: Boolean(organizationId) && Boolean(assetId),
    queryFn: () => getAssetDetailService(organizationId, assetId),
    queryKey: ["faAssetDetail", organizationId, assetId],
    staleTime: 60_000,
  });
};

export const useGetFAMasterDataQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getFAMasterDataService(organizationId),
    queryKey: ["faMasterData", organizationId],
    staleTime: 60_000,
  });
};

export const useGetRFIDTagsQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getRFIDTagsService(organizationId),
    queryKey: ["faRfidTags", organizationId],
    staleTime: 60_000,
  });
};

export const useGetScanOutQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getScanOutService(organizationId),
    queryKey: ["faScanOut", organizationId],
    staleTime: 60_000,
  });
};

export const useGetCheckOutQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getCheckOutService(organizationId),
    queryKey: ["faCheckOut", organizationId],
    staleTime: 60_000,
  });
};

export const useGetTransferQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getTransferService(organizationId),
    queryKey: ["faTransfer", organizationId],
    staleTime: 60_000,
  });
};

export const useGetAuditQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getAuditService(organizationId),
    queryKey: ["faAudit", organizationId],
    staleTime: 60_000,
  });
};

export const useGetMaintenanceQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getMaintenanceService(organizationId),
    queryKey: ["faMaintenance", organizationId],
    staleTime: 60_000,
  });
};

export const useGetSecurityQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getSecurityService(organizationId),
    queryKey: ["faSecurity", organizationId],
    staleTime: 60_000,
  });
};

export const useGetReportsQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getReportsService(organizationId),
    queryKey: ["faReports", organizationId],
    staleTime: 60_000,
  });
};

export const useGetFAUsersQuery = (organizationId: string) => {
  return useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => getFAUsersService(organizationId),
    queryKey: ["faUsers", organizationId],
    staleTime: 60_000,
  });
};
