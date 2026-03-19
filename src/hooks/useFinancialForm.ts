import { Form } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addFinancial, getFinancialById, updateFinancial } from "../api";
import { ROUTES } from "../constants/Routes";
import type { FinancialFormValues, FinancialRecord, FinancialType } from "../types";
import { notify } from "../utils/notify";
import { resolveUserMedicalStoreId } from "../utils/medicalStoreScope";
import { buildUserOptions, useCurrentUser, useUsers } from "./useUsers";
import { getSelectedFinancialStoreId, setFinancialFormValues } from "./useFinancialShared";

// ============ Financial form data and submit logic ============
export const useFinancialForm = (form: ReturnType<typeof Form.useForm<FinancialFormValues>>[0]) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const selectedUserId = (Form.useWatch("userId", form) || "").toString().trim();

  const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUser();
  const isAdmin = String(currentUserData?.user?.role || "").toLowerCase() === "admin";
  const currentUserMedicalStoreId = resolveUserMedicalStoreId(currentUserData?.user);

  const { data: usersData, isLoading: isUsersLoading } = useUsers(isAdmin);

  const { data: financialDataRaw, isLoading: isFinancialLoading } = useQuery({
    queryKey: ["financial", id],
    queryFn: () => getFinancialById(id as string),
    enabled: isEdit,
  });

  const financialData = financialDataRaw as FinancialRecord | undefined;
  const users = usersData?.users || [];

  const selectedMedicalStoreId = useMemo( () =>  getSelectedFinancialStoreId({ isAdmin, isEdit, selectedUserId, currentUserMedicalStoreId, users, financialData, }),
    [currentUserMedicalStoreId, financialData, isAdmin, isEdit, selectedUserId, users]
  );

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({ date: dayjs() });
      return;
    }
    setFinancialFormValues(form, financialData);
  }, [form, financialData, isEdit]);

  type FinancialPayload = { name: string; type: FinancialType; from: string; amount: number; date: string; description?: string; userId?: string; medicalStoreId?: string;};

  const mutation = useMutation({
    mutationFn: (payload: FinancialPayload) =>
      isEdit && id ? updateFinancial(id, payload) : addFinancial(payload),
    onSuccess: () => {
      notify.success(isEdit ? "Financial record updated successfully." : "Financial record added successfully.");
      queryClient.invalidateQueries({ queryKey: ["financials"] });
      if (isEdit && id) {
        queryClient.invalidateQueries({ queryKey: ["financial", id] });
      }
      setTimeout(() => navigate(ROUTES.FINANCIAL.GET_FINANCIAL), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
        return;
      }
      notify.error("Something went wrong");
    },
  });

  const handleSubmit = (values: FinancialFormValues) => {
    const ownerId = isAdmin ? (values.userId || "").trim() : (currentUserData?.user?._id || "");

    if (!ownerId) {
      notify.error(isAdmin ? "Please select user" : "Invalid user session. Please sign in again.");
      return;
    }

    if (!selectedMedicalStoreId) {
      notify.error(isAdmin ? "Selected user has no medical store assigned." : "Medical store is not assigned to current user.");
      return;
    }

    const dateValue = values.date ? dayjs(values.date).format("YYYY-MM-DD") : "";

    const payload: FinancialPayload = {
      name: (values.name || "").trim(),
      type: values.type,
      from: (values.from || "").trim(),
      amount: Number(values.amount || 0),
      date: dateValue,
      description: (values.description || "").trim(),
      medicalStoreId: selectedMedicalStoreId,
      userId: ownerId,
    };

    mutation.mutate(payload);
  };

  return {
    goBack: () => navigate(-1),
    isEdit,
    isAdmin,
    isCurrentUserLoading,
    isUsersLoading,
    isFinancialLoading,
    userOptions: buildUserOptions(users),
    mutation,
    handleSubmit,
  };
};
