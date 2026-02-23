import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { URL_KEYS } from "../../../constants/Url";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompany, getAllCompaniesByQuery } from "../../../api/companyApi";
import { getCurrentUser } from "../../../api/authApi";
import { useConfirm } from "../confirm/ConfirmProvider";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableLoader from "../table/TableLoader";
import TableEmpty from "../table/TableEmpty";
import { Button, Input, Typography } from "antd";

const CompanyTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [companySearchInput, setCompanySearchInput] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["companies", { page, limit, companySearch }],
    queryFn: () =>
      getAllCompaniesByQuery({
        page,
        limit,
        search: companySearch,
        sortBy: "createdAt",
        order: "desc",
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanySearch(companySearchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [companySearchInput]);

  useEffect(() => {
    setPage(1);
  }, [companySearch]);

  const companiesList = data?.companies || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const isAdmin = currentUser?.user?.role === "admin";

  const { mutate } = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const handleDeleteCompany = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Company",
      message: "Are you sure you want to delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldDelete) mutate(id);
  };

  if (isLoading) return <TableLoader tip="Loading companies..." />;
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
          <h2 className="text-lg font-medium text-[#1f2f4f]">Company List</h2>

          <div className="flex flex-wrap items-center gap-3 ps-2">
            <Input
              placeholder="Search by company name..."
              value={companySearchInput}
              onChange={(e) => setCompanySearchInput(e.target.value)}
              allowClear
              className="!w-[240px]"
            />

            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate(ROUTES.COMPANY.ADD_COMPANY)}
              style={{ boxShadow: "none" }}
            >
              Add Company
            </Button>
          </div>
        </div>
      </div>

      <div className="app-table-scroll overflow-x-auto">
        <table className="app-data-table min-w-[1200px] w-full text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="px-6 py-4">Company</th>
              {isAdmin && <th className="px-6 py-4">Added By</th>}
              <th className="px-6 py-4">GST</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4">Pincode</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companiesList?.length > 0 ? (
              companiesList.map((company: any) => (
                <tr key={company._id}>
                  <td className="min-w-[220px] px-6 py-4 font-medium">
                    <div className="flex items-center gap-3 text-[#1f2f4f]">
                      <img
                        src={
                          company.logoImage
                            ? company.logoImage.startsWith("http")
                              ? company.logoImage
                              : `http://localhost:7000${URL_KEYS.UPLOAD.GET_IMAGE}/${company.logoImage}`
                            : "https://via.placeholder.com/40"
                        }
                        alt={company.companyName || "logo"}
                        className="h-10 w-10 rounded-lg border border-[#d7e1f0] object-cover"
                      />
                      {company.companyName}
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">
                      Name : {company.user?.name} <br />
                      {company.user?.email}
                    </td>
                  )}

                  <td className="px-6 py-4">{company.gstNumber}</td>
                  <td className="px-6 py-4">{company.phone}</td>
                  <td className="px-6 py-4">{company.email}</td>
                  <td className="px-6 py-4">{company.city}</td>
                  <td className="px-6 py-4">{company.state}</td>
                  <td className="px-6 py-4">{company.pincode}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        className="app-action-btn"
                        onClick={() => navigate(`/update-company/${company._id}`)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteCompany(company._id)}
                        className="app-action-btn app-action-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="py-6">
                  <TableEmpty description="No Companies Found" />
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
        currentCount={companiesList.length}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default CompanyTable;
