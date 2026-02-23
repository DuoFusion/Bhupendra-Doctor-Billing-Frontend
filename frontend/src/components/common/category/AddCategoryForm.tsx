import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCategory, getCategories, updateCategory } from "../../../api/categoryApi";
import { getCurrentUser } from "../../../api/authApi";
import { Button, Card, Form, Input, List, Typography } from "antd";
import axios from "axios";
import { notify } from "../../../utils/notify";

interface Props {
  onClose?: () => void;
  initialName?: string;
  categoryId?: string;
}

interface CategoryFormValues {
  name: string;
}

const AddCategoryForm = ({ onClose, initialName, categoryId }: Props) => {
  const [form] = Form.useForm<CategoryFormValues>();
  const [name, setName] = useState(initialName || "");
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    const next = initialName || "";
    setName(next);
    form.setFieldsValue({ name: next });
  }, [form, initialName]);

  const suggestions = useMemo(() => {
    const payload = categoriesData?.data;
    if (!payload) return [] as string[];

    const docs = Array.isArray(payload) ? payload : [];
    const isAdmin = currentUser?.user?.role === "admin";
    const editDoc = docs.find((d: any) => d._id === categoryId);
    const targetUserId = isAdmin
      ? editDoc?.userId?._id || editDoc?.userId
      : currentUser?.user?._id;

    return docs
      .filter((d: any) => {
        const uid = d?.userId?._id || d?.userId;
        return isAdmin ? uid === targetUserId : uid === currentUser?.user?._id;
      })
      .map((d: any) => d?.name)
      .filter(Boolean);
  }, [categoriesData, currentUser, categoryId]);

  const addMut = useMutation({
    mutationFn: (payload: { name: string }) => addCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify.success("Category added successfully.");
      setTimeout(() => {
        setName("");
        form.resetFields();
        onClose && onClose();
      }, 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to add category");
      } else {
        notify.error("Failed to add category");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; name: string }) => updateCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      notify.success("Category updated successfully.");
      setTimeout(() => {
        setName("");
        form.resetFields();
        onClose && onClose();
      }, 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update category");
      } else {
        notify.error("Failed to update category");
      }
    },
  });

  const isEdit = !!initialName;

  const handleSubmit = (values: CategoryFormValues) => {
    const normalizedName = values.name.trim();

    if (isEdit) {
      updateMut.mutate({
        id: categoryId!,
        name: normalizedName,
      });
    } else {
      addMut.mutate({ name: normalizedName });
    }
  };

  const isLoading = isEdit ? updateMut.isPending : addMut.isPending;

  return (
    <Card className="app-form-card !rounded-xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
      <Typography.Title level={5} className="!mb-4 !text-[#1f2f4f]">
        {isEdit ? "Update Category" : "Add Category"}
      </Typography.Title>

      <Form<CategoryFormValues>
        form={form}
        onFinish={handleSubmit}
        onValuesChange={(_, allValues) => setName(allValues.name || "")}
        layout="vertical"
        requiredMark={false}
        className="app-form"
      >
        <Form.Item
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Category name must be at least 2 characters" },
            { max: 100, message: "Category name can be maximum 100 characters" },
          ]}
        >
          <Input placeholder="Enter category" maxLength={100} />
        </Form.Item>

        {name && suggestions.length > 0 && (
          <div className="mb-4">
            <Typography.Text className="!mb-2 !block !text-[#7483a3]">Suggestions</Typography.Text>
            <List
              size="small"
              bordered
              className="!rounded-lg !border-[#d7e1f0]"
              dataSource={suggestions
                .filter((s: any) => s.toString().toLowerCase().includes(name.toLowerCase()))
                .slice(0, 6)}
              renderItem={(item: string) => (
                <List.Item
                  className="!cursor-pointer !text-[#2f55d4] hover:!bg-[#f5f8ff]"
                  onClick={() => {
                    setName(item);
                    form.setFieldsValue({ name: item });
                  }}
                >
                  {item}
                </List.Item>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setName("");
              form.resetFields();
              onClose && onClose();
            }}
            style={{ boxShadow: "none" }}
          >
            Cancel
          </Button>

          <Button type="primary" htmlType="submit" loading={isLoading} style={{ boxShadow: "none" }}>
            {isEdit ? "Update" : "Add Category"}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AddCategoryForm;
