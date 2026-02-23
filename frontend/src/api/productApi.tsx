import axios from "axios";
import { URL_KEYS } from "../constants/Url";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

export const getAllProducts = async () => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT);
  return response.data;
};

export const getAllProductsByQuery = async (params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT, { params });
  return response.data;
};

export const addProduct = async (data: any) => {
  const response = await API.post(URL_KEYS.PRODUCT.ADD_PRODUCT,data);
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await API.get(URL_KEYS.PRODUCT.GET_PRODUCT_BY_ID.replace(":id", id));
  return response.data.product;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await API.put(URL_KEYS.PRODUCT.UPDATE_PRODUCT.replace(":id", id), data);
  return response.data;
};


export const deleteProduct = async (id: string) => {
  const response = await API.delete(
    URL_KEYS.PRODUCT.DELETE_PRODUCT.replace(":id", id)
  );
  return response.data;
};
