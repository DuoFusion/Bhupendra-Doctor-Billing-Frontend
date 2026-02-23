import axios from "axios";
import { URL_KEYS } from "../constants/Url";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

export const getCategories = async () => {
  const response = await API.get(URL_KEYS.CATEGORY.GET_CATEGORIES);
  return response.data;
};

export const getCategoriesByQuery = async (params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const response = await API.get(URL_KEYS.CATEGORY.GET_CATEGORIES, { params });
  return response.data;
};

export const addCategory = async (data: { name: string }) => {
  const response = await API.post(URL_KEYS.CATEGORY.ADD_CATEGORY, data);
  return response.data;
};

export const updateCategory = async (data: { id: string; name: string }) => {
  const response = await API.put(URL_KEYS.CATEGORY.UPDATE_CATEGORY, data);
  return response.data;
};

export const deleteCategory = async (data: { id: string }) => {
  const response = await API.delete(URL_KEYS.CATEGORY.DELETE_CATEGORY, { data });
  return response.data;
};
