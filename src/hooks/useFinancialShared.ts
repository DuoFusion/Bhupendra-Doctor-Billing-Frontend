import { Form } from "antd";
import dayjs from "dayjs";
import type { FinancialFormValues, FinancialRecord, UserRecord } from "../types";
import { resolveOwnerUserId, resolveObjectId, resolveUserMedicalStoreId } from "../utils/medicalStoreScope";

// ============ Added by name ============
export const getFinancialAddedByName = (record: FinancialRecord) => {
  const owner = record.userId;
  return owner && typeof owner === "object" ? owner.name || "-" : "-";
};

// ============ Added by email ============
export const getFinancialAddedByEmail = (record: FinancialRecord) => {
  const owner = record.userId;
  return owner && typeof owner === "object" ? owner.email || "-" : "-";
};

// ============ Resolve selected medical store ============
export const getSelectedFinancialStoreId = ({ isAdmin, isEdit, selectedUserId, currentUserMedicalStoreId, users, financialData,}: { isAdmin: boolean; isEdit: boolean; selectedUserId: string; currentUserMedicalStoreId: string; users: UserRecord[]; financialData: FinancialRecord | undefined;}) => {
  if (!isAdmin) return currentUserMedicalStoreId;

  if (isEdit) {
    const ownerId = resolveOwnerUserId(financialData);
    const ownerUser = users.find((user) => user._id === ownerId);
    return resolveUserMedicalStoreId(ownerUser) || resolveObjectId(financialData?.medicalStoreId);
  }

  if (!selectedUserId) return "";
  const selectedUser = users.find((user) => user._id === selectedUserId);
  return resolveUserMedicalStoreId(selectedUser);
};

// ============ Fill edit form data ============
export const setFinancialFormValues = (
  form: ReturnType<typeof Form.useForm<FinancialFormValues>>[0],
  financialData: FinancialRecord | undefined
) => {
  if (!financialData) return;

  form.setFieldsValue({
    name: financialData.name || "",
    type: financialData.type || "Income",
    from: financialData.from || "",
    amount: financialData.amount ?? "",
    description: financialData.description || "",
    date: financialData.date ? dayjs(financialData.date) : undefined,
    userId: resolveOwnerUserId(financialData),
  });
};
