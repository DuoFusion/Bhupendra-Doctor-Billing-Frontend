import type { MedicalStoreRef, PaginationMeta } from "./common";

export type FinancialType = "Income" | "Expense";

export type FinancialFormValues = {
  name: string;
  type: FinancialType;
  from: string;
  amount: number | string;
  date: string | any;
  description?: string;
  userId?: string;
  medicalStoreId?: string;
};

export type FinancialStatusTab = "active" | "inactive";

export type FinancialRecord = {
  _id: string;
  name: string;
  type: FinancialType;
  from: string;
  amount: number;
  date: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  medicalStoreId?: MedicalStoreRef;
};

export type FinancialListResponse = {
  status: boolean;
  message?: string;
  fiadd_financial?: FinancialRecord[];
  data?: FinancialRecord[];
  pagination?: PaginationMeta;
};
