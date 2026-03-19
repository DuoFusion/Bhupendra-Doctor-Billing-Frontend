import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { deleteFinancial, getFinancialByQuery, updateFinancialStatus } from "../api";
import type { FinancialRecord, FinancialStatusTab } from "../types";
import { notify } from "../utils/notify";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { resolveUserMedicalStoreIds } from "../utils/medicalStoreScope";
import { useCurrentUser } from "./useUsers";
import { buildMedicalStoreOptions, resolveMedicalStoreName as getMedicalStoreName, useMedicalStores } from "./useMedicalStores";

type PendingStatusChange = {
  open: boolean;
  financial: FinancialRecord | null;
  nextIsActive: boolean;
  secondsLeft: number;
};

const initialPendingStatus: PendingStatusChange = {
  open: false,
  financial: null,
  nextIsActive: false,
  secondsLeft: 10,
};

// ============ Financial table data, filters and actions ============
export const useFinancialTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [statusTab, setStatusTab] = useState<FinancialStatusTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedMedicalStore, setSelectedMedicalStore] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange>(initialPendingStatus);

  const { data: currentUserData } = useCurrentUser();
  const isAdmin = currentUserData?.user?.role === "admin";

  const { data: storesData, isLoading: isStoresLoading } = useMedicalStores();
  const stores = storesData?.stores || [];
  const allowedStoreIds = isAdmin ? stores.map((store) => store._id) : resolveUserMedicalStoreIds(currentUserData?.user);
  const medicalStoreOptions = buildMedicalStoreOptions(stores, allowedStoreIds);

  const medicalStoreNameById = useMemo(
    () => new Map<string, string>(stores.map((store) => [String(store._id), store.name || "Unnamed Medical Store"])),
    [stores]
  );

  useEffect(() => {
    if (!isAdmin && !selectedMedicalStore && medicalStoreOptions.length > 0) {
      setSelectedMedicalStore(medicalStoreOptions[0].value);
    }
  }, [isAdmin, medicalStoreOptions, selectedMedicalStore]);

  const fromDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const toDate = dateRange?.[1]?.format("YYYY-MM-DD");

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["financials", searchValue, selectedType, fromDate, toDate, selectedMedicalStore, statusTab, page, limit],
    queryFn: () =>
      getFinancialByQuery({
        search: searchValue || undefined,
        type: selectedType || undefined,
        fromDate,
        toDate,
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
        isActive: statusTab === "active",
        page,
        limit,
      }),
    enabled: !!currentUserData?.user,
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, searchValue, selectedMedicalStore, selectedType, fromDate, toDate]);

  const refreshFinancials = () => queryClient.invalidateQueries({ queryKey: ["financials"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFinancial(id),
    onSuccess: () => {
      notify.success("Financial record deleted successfully.");
      refreshFinancials();
    },
    onError: () => notify.error("Failed to delete financial record."),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) => updateFinancialStatus(payload.id, payload.isActive),
    onSuccess: (_, payload) => {
      notify.success(payload.isActive ? "Record activated successfully." : "Record deactivated successfully.");
      refreshFinancials();
    },
    onError: () => notify.error("Failed to update status."),
  });

  const handleDeleteFinancial = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Financial Record",
      message: "Are you sure you want to permanently remove this record?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });

    if (shouldDelete) {
      deleteMutation.mutate(id);
    }
  };

  const openStatusModal = (financial: FinancialRecord) => {
    setPendingStatus({
      open: true,
      financial,
      nextIsActive: financial.isActive === false,
      secondsLeft: 10,
    });
  };

  const closeStatusModal = () => {
    if (!statusMutation.isPending) {
      setPendingStatus(initialPendingStatus);
    }
  };

  const applyStatusChange = () => {
    if (!pendingStatus.financial) return;
    statusMutation.mutate({ id: pendingStatus.financial._id, isActive: pendingStatus.nextIsActive });
    setPendingStatus(initialPendingStatus);
  };

  useEffect(() => {
    if (!pendingStatus.open || pendingStatus.secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setPendingStatus((prev) => ({ ...prev, secondsLeft: Math.max(prev.secondsLeft - 1, 0) }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pendingStatus.open, pendingStatus.secondsLeft]);

  useEffect(() => {
    if (pendingStatus.open && pendingStatus.secondsLeft === 0 && !statusMutation.isPending) {
      applyStatusChange();
    }
  }, [pendingStatus.open, pendingStatus.secondsLeft, statusMutation.isPending]);

  const financials = (data?.fiadd_financial || data?.data || []) as FinancialRecord[];

  return {
    navigate,
    isAdmin,
    statusTab,
    setStatusTab,
    searchInput,
    setSearchInput,
    selectedType,
    setSelectedType,
    dateRange,
    setDateRange,
    selectedMedicalStore,
    setSelectedMedicalStore,
    page,
    setPage,
    limit,
    setLimit,
    pendingStatus,
    medicalStoreOptions,
    financials,
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 0,
    isLoading,
    isStoresLoading,
    isError,
    error,
    isFetching,
    statusMutation,
    resolveMedicalStoreName: (medicalStoreId: FinancialRecord["medicalStoreId"]) =>
      getMedicalStoreName(medicalStoreId, medicalStoreNameById),
    handleDeleteFinancial,
    closeStatusModal,
    openStatusModal,
    applyStatusChange,
  };
};
