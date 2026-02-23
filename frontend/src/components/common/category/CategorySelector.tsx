import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../api/categoryApi";
import { getCurrentUser } from "../../../api/authApi";
import { Select, Typography } from "antd";

const CategorySelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: currentUser } = useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUser });

  const userCategories = (() => {
    const payload = categoriesData?.data;
    if (!payload || !Array.isArray(payload)) return [] as string[];

    const isAdmin = currentUser?.user?.role === "admin";
    if (isAdmin) {
      return Array.from(new Set(payload.map((d: any) => d?.name).filter(Boolean)));
    }

    return payload
      .filter((d: any) => (d?.userId?._id || d?.userId) === currentUser?.user?._id)
      .map((d: any) => d?.name)
      .filter(Boolean);
  })();

  if (!userCategories || userCategories.length === 0) {
    return <Typography.Text className="!text-[#7483a3]">No categories available. Please add a category first.</Typography.Text>;
  }

  return (
    <Select
      value={value || undefined}
      onChange={(v) => onChange(v)}
      placeholder="Select Category"
      options={userCategories.map((c: string) => ({ value: c, label: c }))}
      className="!w-full"
    />
  );
};

export default CategorySelector;
