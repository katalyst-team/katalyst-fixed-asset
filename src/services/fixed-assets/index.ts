/* eslint-disable no-unused-vars */
import fetcher, { ApiResponse } from "..";
import {
  ASSETS,
  AUDIT_ZONES,
  CATEGORY_STATS,
  CHECK_OUTS,
  DISPOSALS,
  FA_USERS,
  FINANCIAL_CATEGORIES,
  HEALTH_DATA,
  MAINTENANCE_UPCOMING,
  PM_RULES,
  PM_SCHEDULE,
  PRE_USE_ASSETS,
  RECENT_ACTIVITY,
  REPORT_TEMPLATES,
  RFID_READS,
  RFID_TAGS,
  SECURITY_ALERTS,
  SITES,
  TRANSFERS,
  WORK_ORDERS,
} from "./mock";

const mockResponse = <T>(data: T, message = "OK"): ApiResponse<T> => ({
  data,
  message,
  metadata: {
    code: "200",
    correlation_id: "mock",
    message,
    server_time: Date.now(),
    success: true,
  },
  pagination: {
    count: Array.isArray(data) ? data.length : 1,
    next_cursor: "",
    prev_cursor: "",
    total_count: Array.isArray(data) ? data.length : 1,
  },
});

export const getFADashboardService = async (
  _organizationId: string,
): Promise<
  ApiResponse<{
    activity: typeof RECENT_ACTIVITY;
    categoryStats: typeof CATEGORY_STATS;
    financialCategories: typeof FINANCIAL_CATEGORIES;
    maintenanceUpcoming: typeof MAINTENANCE_UPCOMING;
    rfidReads: typeof RFID_READS;
    sites: typeof SITES;
  }>
> => {
  return mockResponse({
    activity: RECENT_ACTIVITY,
    categoryStats: CATEGORY_STATS,
    financialCategories: FINANCIAL_CATEGORIES,
    maintenanceUpcoming: MAINTENANCE_UPCOMING,
    rfidReads: RFID_READS,
    sites: SITES,
  });
};

export const getAssetRegisterService = async (
  _organizationId: string,
): Promise<ApiResponse<{ assets: typeof ASSETS }>> => {
  return mockResponse({ assets: ASSETS });
};

export const getAssetDetailService = async (
  _organizationId: string,
  assetId: string,
): Promise<ApiResponse<{ asset: (typeof ASSETS)[number] | null }>> => {
  const asset = ASSETS.find((a) => a.id === assetId) ?? null;
  return mockResponse({ asset });
};

export const getFAMasterDataService = async (
  _organizationId: string,
): Promise<
  ApiResponse<{
    masterDataSections: typeof import("./mock").MASTER_DATA_SECTIONS;
  }>
> => {
  const { MASTER_DATA_SECTIONS } = await import("./mock");
  return mockResponse({ masterDataSections: MASTER_DATA_SECTIONS });
};

export const getRFIDTagsService = async (
  _organizationId: string,
): Promise<ApiResponse<{ tags: typeof RFID_TAGS }>> => {
  return mockResponse({ tags: RFID_TAGS });
};

export const getScanOutService = async (
  _organizationId: string,
): Promise<ApiResponse<{ disposals: typeof DISPOSALS }>> => {
  return mockResponse({ disposals: DISPOSALS });
};

export const getCheckOutService = async (
  _organizationId: string,
): Promise<ApiResponse<{ checkOuts: typeof CHECK_OUTS }>> => {
  return mockResponse({ checkOuts: CHECK_OUTS });
};

export const getTransferService = async (
  _organizationId: string,
): Promise<ApiResponse<{ transfers: typeof TRANSFERS }>> => {
  return mockResponse({ transfers: TRANSFERS });
};

export const getAuditService = async (
  _organizationId: string,
): Promise<ApiResponse<{ zones: typeof AUDIT_ZONES }>> => {
  return mockResponse({ zones: AUDIT_ZONES });
};

export const getMaintenanceService = async (
  _organizationId: string,
): Promise<
  ApiResponse<{
    healthData: typeof HEALTH_DATA;
    pmRules: typeof PM_RULES;
    pmSchedule: typeof PM_SCHEDULE;
    preUseAssets: typeof PRE_USE_ASSETS;
    workOrders: typeof WORK_ORDERS;
  }>
> => {
  return mockResponse({
    healthData: HEALTH_DATA,
    pmRules: PM_RULES,
    pmSchedule: PM_SCHEDULE,
    preUseAssets: PRE_USE_ASSETS,
    workOrders: WORK_ORDERS,
  });
};

export const getSecurityService = async (
  _organizationId: string,
): Promise<ApiResponse<{ alerts: typeof SECURITY_ALERTS }>> => {
  return mockResponse({ alerts: SECURITY_ALERTS });
};

export const getReportsService = async (
  _organizationId: string,
): Promise<ApiResponse<{ templates: typeof REPORT_TEMPLATES }>> => {
  return mockResponse({ templates: REPORT_TEMPLATES });
};

export const getFAUsersService = async (
  _organizationId: string,
): Promise<ApiResponse<{ users: typeof FA_USERS }>> => {
  return mockResponse({ users: FA_USERS });
};

export { fetcher };
