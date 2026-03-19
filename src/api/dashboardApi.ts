import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";
import type { DashboardStatsResponse } from "../types";

const API = createApiClient();

export const getDashboardStats = async (params?: { medicalStoreId?: string; fromDate?: string; toDate?: string; companyId?: string }) => {
  const response = await API.get<DashboardStatsResponse>(URL_KEYS.DASHBOARD.GET_STATS, {
    params,
  });
  return response.data;
};
