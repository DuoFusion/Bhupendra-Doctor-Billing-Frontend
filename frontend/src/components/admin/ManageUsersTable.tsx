import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/Routes";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsersByQuery, deleteUser } from "../../api/userApi";
import { useConfirm } from "../common/confirm/ConfirmProvider";
import ServerPaginationControls from "../common/table/ServerPaginationControls";
import TableLoader from "../common/table/TableLoader";
import TableEmpty from "../common/table/TableEmpty";
import { Button, Input, Select, Tag, Typography } from "antd";

const ManageUsersTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", { page, limit, userSearch, userSortOrder }],
    queryFn: () =>
      getAllUsersByQuery({
        page,
        limit,
        search: userSearch,
        sortBy: "role",
        order: userSortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearch(userSearchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearchInput]);

  useEffect(() => {
    setPage(1);
  }, [userSearch, userSortOrder]);

  const usersList = data?.users || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  const { mutate } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleDeleteUser = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldDelete) mutate(id);
  };

  if (isLoading) return <TableLoader tip="Loading users..." />;

  if (isError)
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as Error).message}
      </Typography.Text>
    );

  return (
    <div className="app-table-card rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="px-6 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-[#1f2f4f]">User Management</h2>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by user name..."
              value={userSearchInput}
              onChange={(e) => setUserSearchInput(e.target.value)}
              allowClear
              className="!w-[240px]"
            />

            <Select
              value={userSortOrder}
              onChange={(value) => setUserSortOrder(value as "asc" | "desc")}
              options={[
                { value: "asc", label: "Role: Admin to User" },
                { value: "desc", label: "Role: User to Admin" },
              ]}
              className="!w-[190px]"
            />

            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate(ROUTES.ADMIN.ADD_USERS)}
              style={{ boxShadow: "none" }}
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      <div className="app-table-scroll overflow-x-auto">
        <table className="app-data-table min-w-[900px] w-full text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {usersList?.length > 0 ? (
              usersList.map((user: any) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2f4f]">{user.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <Tag
                      className="!rounded-full !px-3 !py-[2px]"
                      color={user.role === "admin" ? "blue" : "green"}
                    >
                      {user.role}
                    </Tag>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/update-user/${user._id}`)}
                        className="app-action-btn"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
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
                <td colSpan={4} className="py-6">
                  <TableEmpty description="No Users Found" />
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
        currentCount={usersList.length}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default ManageUsersTable;
