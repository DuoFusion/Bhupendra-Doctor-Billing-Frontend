import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoriesByQuery, deleteCategory } from "../../../api/categoryApi";
import { getCurrentUser } from "../../../api/authApi";
import AddCategoryForm from "./AddCategoryForm";
import { useConfirm } from "../confirm/ConfirmProvider";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableLoader from "../table/TableLoader";
import TableEmpty from "../table/TableEmpty";
import { Button, Input, Typography } from "antd";

const CategoryTable = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: currentUser } = useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUser });
  const isAdmin = currentUser?.user?.role === "admin";

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", { page, limit, search }],
    queryFn: () => getCategoriesByQuery({ page, limit, search, sortBy: "name", order: "asc" }),
    enabled: !!currentUser,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if ((showAdd || showEdit) && formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAdd, showEdit]);

  const categoriesList = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  const { mutate } = useMutation({
    mutationFn: (payload: { id: string }) => deleteCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const handleDeleteCategory = async (payload: { id: string }) => {
    const shouldDelete = await confirm({
      title: "Delete Category",
      message: "Are you sure you want to delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldDelete) mutate(payload);
  };

  if (isLoading) return <TableLoader tip="Loading categories..." />;
  if (isError)
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as any)?.response?.data?.message || "Something went wrong"}
      </Typography.Text>
    );

  return (
    <div className="space-y-4">
      <div ref={formSectionRef}>
        {showAdd && <AddCategoryForm onClose={() => setShowAdd(false)} />}

        {showEdit && editItem && (
          <AddCategoryForm
            initialName={editItem.name}
            categoryId={editItem.id}
            onClose={() => {
              setShowEdit(false);
              setEditItem(null);
            }}
          />
        )}
      </div>

      <div className="app-table-card rounded-2xl border border-[#d7e1f0] bg-white">
        <div className="px-6 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-[#1f2f4f]">Category List</h2>

            <div className="flex flex-wrap items-center gap-3 ps-2">
              <Input
                placeholder="Search by category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
                className="!w-[230px]"
              />

              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  setShowEdit(false);
                  setEditItem(null);
                  setShowAdd(true);
                }}
                style={{ boxShadow: "none" }}
              >
                Add Category
              </Button>
            </div>
          </div>
        </div>

        <div className="app-table-scroll overflow-x-auto">
          <table className="app-data-table min-w-[800px] w-full text-left text-sm text-[#3e5175]">
            <thead>
              <tr>
                <th className="px-6 py-4">Category</th>
                {isAdmin && <th className="px-6 py-4">Added By</th>}
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categoriesList?.length > 0 ? (
                categoriesList.map((item: any) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4">{item.name}</td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">
                        Name : {item.userId?.name} <br /> {item.userId?.email}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setShowAdd(false);
                            setEditItem({ id: item._id, name: item.name });
                            setShowEdit(true);
                          }}
                          className="app-action-btn"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory({ id: item._id })}
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
                  <td colSpan={isAdmin ? 3 : 2} className="py-6">
                    <TableEmpty description="No Categories Found" />
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
          currentCount={categoriesList.length}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default CategoryTable;
