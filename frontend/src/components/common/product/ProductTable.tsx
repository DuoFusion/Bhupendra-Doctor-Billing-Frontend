import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { ArrowDownUp } from "lucide-react";
import { deleteProduct, getAllProductsByQuery } from "../../../api/productApi";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { getCurrentUser } from "../../../api/authApi";
import { useConfirm } from "../confirm/ConfirmProvider";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableLoader from "../table/TableLoader";
import TableEmpty from "../table/TableEmpty";
import { Button, Input, Select, Tag, Typography } from "antd";

const ProductTable = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"category" | "sellingPrice" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", { page, limit, searchTerm, sortBy, sortOrder }],
    queryFn: () =>
      getAllProductsByQuery({
        page,
        limit,
        search: searchTerm,
        sortBy: sortBy || "createdAt",
        order: sortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const productsList = data?.products || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const isAdmin = currentUser?.user?.role === "admin";

  const { mutate } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDeleteProduct = async (id: string) => {
    const shouldDelete = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldDelete) mutate(id);
  };

  if (isLoading) return <TableLoader tip="Loading products..." />;
  if (isError)
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as any)?.message}
      </Typography.Text>
    );

  return (
    <div className="app-table-card rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="px-6 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-[#1f2f4f]">Product List</h2>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by product name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              allowClear
              className="!w-[240px]"
            />

            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as "category" | "sellingPrice" | "")}
              options={[
                { value: "", label: "No sort" },
                { value: "category", label: "Category (A to Z)" },
                { value: "sellingPrice", label: "Price" },
              ]}
              className="!w-[170px]"
            />

            <Button
              icon={<ArrowDownUp size={16} />}
              onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
              style={{ boxShadow: "none" }}
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>

            {sortBy && (
              <span className="text-sm text-[#5f7091]">
                Sorted by: <strong className="text-[#1f2f4f]">{sortBy === "category" ? "Category" : "Price"} ({sortOrder})</strong>
              </span>
            )}

            <Button
              type="primary"
              icon={<FiPlus size={16} />}
              onClick={() => navigate(ROUTES.PRODUCTS.ADD_PRODUCT)}
              style={{ boxShadow: "none" }}
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="app-table-scroll overflow-x-auto">
        <table className="app-data-table min-w-[1500px] w-full text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Company</th>
              {isAdmin && <th className="px-6 py-4">Added By</th>}
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">HSN</th>
              <th className="px-6 py-4">MRP</th>
              <th className="px-6 py-4">Selling</th>
              <th className="px-6 py-4">GST%</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {productsList?.length > 0 ? (
              productsList.map((item: any) => (
                <tr key={item._id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2f4f]">{item.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.company?.companyName}</td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">
                      Name : {item.user?.name} <br />
                      {item.user?.email}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-6 py-4">{item.category}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.hsnCode}</td>
                  <td className="whitespace-nowrap px-6 py-4">Rs {item.mrp}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#15803d]">Rs {item.sellingPrice}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.gstPercent}%</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {item.stockStatus === "Out Of Stock" ? (
                      <Tag color="red">Out Of Stock</Tag>
                    ) : (
                      <Tag color="green">{item.stock}</Tag>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">{item.expiry}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button className="app-action-btn" onClick={() => navigate(`/update-product/${item._id}`)}>
                        <FiEdit size={16} />
                      </button>
                      <button className="app-action-btn app-action-danger" onClick={() => handleDeleteProduct(item._id)}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 11 : 10} className="py-6">
                  <TableEmpty description="No Products Found" />
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
        currentCount={productsList.length}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default ProductTable;
