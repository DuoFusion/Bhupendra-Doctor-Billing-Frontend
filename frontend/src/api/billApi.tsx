import axios from "axios";
import { URL_KEYS } from "../constants/Url";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

export const getAllBills = async () => {
  const response = await API.get(URL_KEYS.BILL.GET_BILLS);
  return response.data;
};

export const getAllBillsByQuery = async (params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const response = await API.get(URL_KEYS.BILL.GET_BILLS, { params });
  return response.data;
};

export const getBillById = async (id: string) => {
  const response = await API.get(
    URL_KEYS.BILL.GET_BILL_BY_ID.replace(":id", id)
  );
  return response.data.bill;
};

export const addBill = async (data: {
  company?: string;
  billStatus?: string;
  user: string;
  items: {
    product: string;
    qty: number;
    freeQty?: number;
    discount?: number;
  }[];
  paymentMethod: string;
  discount?: number;
}) => {
  const response = await API.post(
    URL_KEYS.BILL.ADD_BILL,
    data
  );
  return response.data;
};

export const updateBill = async (
  id: string,
  data: {
    company?: string;
    billStatus?: string;
    user: string;
    items: {
      product: string;
      qty: number;
      freeQty?: number;
      discount?: number;
    }[];
    paymentMethod: string;
    discount?: number;
  }
) => {
  const response = await API.put(
    URL_KEYS.BILL.UPDATE_BILL.replace(":id", id),
    data
  );
  return response.data;
};

export const deleteBill = async (id: string) => {
  const response = await API.delete(
    URL_KEYS.BILL.DELETE_BILL.replace(":id", id)
  );
  return response.data;
};
