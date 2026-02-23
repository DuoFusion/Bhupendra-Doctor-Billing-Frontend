import axios from "axios";
import { URL_KEYS } from "../constants/Url";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

export const getAllCompanies = async () => {
  const response = await API.get(URL_KEYS.COMPANY.GET_COMPANY);
  return response.data;
};

export const getAllCompaniesByQuery = async (params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const response = await API.get(URL_KEYS.COMPANY.GET_COMPANY, { params });
  return response.data;
};

export const deleteCompany = async (id: string) => {
  const response = await API.delete(
    URL_KEYS.COMPANY.DELETE_COMPANY.replace(":id", id)
  );
  return response.data;
};

export const addCompany = async (data: any) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key !== "logo" && data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  if (data.logo) {
    formData.append("logoImage", data.logo);
  }

  const response = await API.post(
    URL_KEYS.COMPANY.ADD_COMPANY,
    formData
  );

  return response.data;
};

export const getCompanyById = async (id: string) => {
  const response = await API.get(
    URL_KEYS.COMPANY.GET_COMPANY_BY_ID.replace(":id", id)
  );
  return response.data.company;
};


export const updateCompany = async (id: string, data: any) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key !== "logo" && data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  if (data.logo) {
    formData.append("logoImage", data.logo);
  }

  const response = await API.put(
    URL_KEYS.COMPANY.UPDATE_COMPANY.replace(":id", id),
    formData
  );

  return response.data;
};
