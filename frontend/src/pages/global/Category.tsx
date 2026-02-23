import CategoryTable from "../../components/common/category/CategoryTable";

const Category = () => {
  return (
    <div className="mt-6 min-h-[calc(100vh-7rem)] text-[#24395d]">
      <div className="w-full overflow-hidden rounded-2xl">
        <CategoryTable />
      </div>
    </div>
  );
};

export default Category;
