import ProductTable from "../../components/common/product/ProductTable";

const Product = () => {
  return (
    <div className="mt-6 min-h-[calc(100vh-7rem)] text-[#24395d]">
      <div className="w-full overflow-hidden rounded-2xl">
        <ProductTable />
      </div>
    </div>
  );
};

export default Product;
