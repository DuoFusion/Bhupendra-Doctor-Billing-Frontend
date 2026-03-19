import { URL_KEYS } from "../constants/Url";
import { createApiClient } from "./client";

const API = createApiClient();

// ============ Get Financial Records (query) ============
export const getFinancialByQuery = async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; order?: "asc" | "desc"; type?: string; fromDate?: string; toDate?: string; medicalStoreId?: string; isActive?: boolean; all?: boolean;}) => {
  const response = await API.get(URL_KEYS.FINANCIAL.GET_FINANCIAL, { params });
  return response.data;
};

// ============ Get Financial By ID ============
export const getFinancialById = async (id: string) => {
  const response = await API.get(URL_KEYS.FINANCIAL.GET_FINANCIAL_BY_ID.replace(":id", id));
  return response.data;
};

// ============ Add Financial ============
export const addFinancial = async (payload: { name: string; type: string; from: string; amount: number; date: string; description?: string; userId?: string; medicalStoreId?: string;}) => {
  const response = await API.post(URL_KEYS.FINANCIAL.ADD_FINANCIAL, payload);
  return response.data;
};

// ============ Update Financial ============
export const updateFinancial = async (id: string, payload: { name?: string; type?: string; from?: string; amount?: number; date?: string; description?: string; userId?: string; medicalStoreId?: string;}) => {
  const response = await API.put(URL_KEYS.FINANCIAL.UPDATE_FINANCIAL.replace(":id", id), payload);
  return response.data;
};

// ============ Delete Financial ============
export const deleteFinancial = async (id: string) => {
  const response = await API.delete(URL_KEYS.FINANCIAL.DELETE_FINANCIAL.replace(":id", id));
  return response.data;
};

// ============ Update Financial Status ============
export const updateFinancialStatus = async (id: string, isActive: boolean) => {
  const response = await API.patch(URL_KEYS.FINANCIAL.UPDATE_FINANCIAL_STATUS.replace(":id", id), { isActive });
  return response.data;
};
