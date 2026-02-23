import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, View } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllBillsByQuery, deleteBill } from "../../../api/billApi";
import { getCurrentUser } from "../../../api/authApi";
import { useConfirm } from "../confirm/ConfirmProvider";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableLoader from "../table/TableLoader";
import TableEmpty from "../table/TableEmpty";
import { Button, Input, Select, Typography } from "antd";

const BillTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [billSearchInput, setBillSearchInput] = useState("");
  const [billSearch, setBillSearch] = useState("");
  const [billSortBy, setBillSortBy] = useState<"billStatus" | "grandTotal" | "">("");
  const [billSortOrder, setBillSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bills", { page, limit, billSearch, billSortBy, billSortOrder }],
    queryFn: () =>
      getAllBillsByQuery({
        page,
        limit,
        search: billSearch,
        sortBy: billSortBy || "createdAt",
        order: billSortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBillSearch(billSearchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [billSearchInput]);

  useEffect(() => {
    setPage(1);
  }, [billSearch, billSortBy, billSortOrder]);

  const billsList = data?.bills || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const isAdmin = currentUser?.user?.role === "admin";

  const { mutate } = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
  });

  const handleDeleteBill = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Bill",
      message: "Are you sure you want to delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldDelete) mutate(id);
  };

  if (isLoading) return <TableLoader tip="Loading bills..." />;

  if (isError)
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as any)?.response?.data?.message || "Something went wrong"}
      </Typography.Text>
    );

  return (
    <div className="app-table-card rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="px-6 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-[#1f2f4f]">Bill List</h2>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by bill number, status or payment..."
              value={billSearchInput}
              onChange={(e) => setBillSearchInput(e.target.value)}
              allowClear
              className="!w-[280px]"
            />

            <Select
              value={billSortBy}
              onChange={(value) => setBillSortBy(value as "billStatus" | "grandTotal" | "")}
              options={[
                { value: "", label: "No sort" },
                { value: "billStatus", label: "Status" },
                { value: "grandTotal", label: "Grand Total" },
              ]}
              className="!w-[170px]"
            />

            <Button onClick={() => setBillSortOrder((s) => (s === "asc" ? "desc" : "asc"))} style={{ boxShadow: "none" }}>
              {billSortOrder === "asc" ? "Asc" : "Desc"}
            </Button>

            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate(ROUTES.BILL.GENERATE_BILL)}
              style={{ boxShadow: "none" }}
            >
              Generate Bill
            </Button>
          </div>
        </div>
      </div>

      <div className="app-table-scroll overflow-x-auto">
        <table className="app-data-table min-w-[1800px] w-full text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="px-6 py-4">SR No</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Bill Number</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total GST</th>
              <th className="px-6 py-4">Items</th>
              {isAdmin && <th className="px-6 py-4">Created By</th>}
              <th className="px-6 py-4">Sub Total</th>
              <th className="px-6 py-4">Grand Total</th>
              <th className="px-6 py-4 text-center">View Invoice</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {billsList?.length > 0 ? (
              billsList.map((bill: any, index: number) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        bill.billStatus === "Paid" ? "bg-[#ecfdf3] text-[#15803d]" : "bg-[#fff1f2] text-[#dc2626]"
                      }`}
                    >
                      {bill.billStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">{bill.billNumber}</td>
                  <td className="px-6 py-4">{bill.items?.length ? bill.items.map((item: any) => item.productName).join(", ") : "-"}</td>
                  <td className="px-6 py-4">{bill.items?.[0]?.company?.companyName || "-"}</td>
                  <td className="px-6 py-4">{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4">Rs {bill.totalGST}</td>
                  <td className="px-6 py-4">{bill.items?.length}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-[#7180a0]">
                      {bill.user?.name || "-"} <br />
                      {bill.user?.email || ""}
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-[#2f55d4]">Rs {bill.subTotal}</td>
                  <td className="px-6 py-4 font-semibold text-[#15803d]">Rs {bill.grandTotal}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="app-action-btn" onClick={() => navigate(ROUTES.BILL.VIEW_INVOICE.replace(":id", bill._id))}>
                      <View size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => navigate(ROUTES.BILL.UPDATE_BILL.replace(":id", bill._id))} className="app-action-btn">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteBill(bill._id)} className="app-action-btn app-action-danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 13 : 12} className="py-6">
                  <TableEmpty description="No Bills Found" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ServerPaginationControls
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        currentCount={billsList.length}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default BillTable;
