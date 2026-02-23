import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/Routes";

type Props = {
  products: any[];
  currentUserRole?: string;
};

const ProductRecentTable = ({ products = [], currentUserRole }: Props) => {
  const navigate = useNavigate();

  const isAdmin = currentUserRole === "admin";

  const recentProducts = (products || [])
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="app-table-card min-w-0 rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="flex items-center justify-between border-b border-[#e6ecf7] px-6 py-4">
        <h2 className="text-lg font-medium text-[#1f2f4f]">Products</h2>
        <button
          onClick={() => navigate(ROUTES.PRODUCTS.GET_PRODUCTS)}
          className="flex items-center gap-2 text-sm text-[#2f55d4] transition hover:text-[#274bc0]"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="app-table-scroll overflow-x-auto [touch-action:pan-x]">
        <table className="app-data-table w-max min-w-[1180px] text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-6 py-4">Product</th>
              <th className="whitespace-nowrap px-6 py-4">Company</th>
              {isAdmin && <th className="whitespace-nowrap px-6 py-4">Added By</th>}
              <th className="whitespace-nowrap px-6 py-4">Category</th>
              <th className="whitespace-nowrap px-6 py-4">HSN</th>
              <th className="whitespace-nowrap px-6 py-4">MRP</th>
              <th className="whitespace-nowrap px-6 py-4">Selling</th>
              <th className="whitespace-nowrap px-6 py-4">GST%</th>
              <th className="whitespace-nowrap px-6 py-4">Stock</th>
              <th className="whitespace-nowrap px-6 py-4">Expiry</th>
            </tr>
          </thead>

          <tbody>
            {recentProducts.length > 0 ? (
              recentProducts.map((item: any) => (
                <tr key={item._id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2f4f]">{item.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.company?.companyName}</td>

                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">
                      {item.user?.name} <br />
                      {item.user?.email}
                    </td>
                  )}

                  <td className="whitespace-nowrap px-6 py-4">{item.category}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.hsnCode}</td>
                  <td className="whitespace-nowrap px-6 py-4">Rs {item.mrp}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#15803d]">Rs {item.sellingPrice}</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.gstPercent}%</td>
                  <td className="whitespace-nowrap px-6 py-4">{item.stock}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">{item.expiry}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 10 : 9} className="py-6 text-center text-[#7180a0]">
                  No Recent Products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductRecentTable;
