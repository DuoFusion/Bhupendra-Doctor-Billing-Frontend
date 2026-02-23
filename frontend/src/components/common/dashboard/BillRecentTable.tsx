import { useNavigate } from "react-router-dom";
import { ArrowRight, View } from "lucide-react";
import { ROUTES } from "../../../constants/Routes";

type Props = {
  bills: any[];
  currentUserRole?: string;
};

const BillRecentTable = ({ bills = [], currentUserRole }: Props) => {
  const navigate = useNavigate();

  const isAdmin = currentUserRole === "admin";

  const recentBills = (bills || [])
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="app-table-card min-w-0 rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="flex items-center justify-between border-b border-[#e6ecf7] px-6 py-4">
        <h2 className="text-lg font-medium text-[#1f2f4f]">Bills</h2>

        <button
          onClick={() => navigate(ROUTES.BILL.GET_BILLS)}
          className="flex items-center gap-2 text-sm text-[#2f55d4] transition hover:text-[#274bc0]"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="app-table-scroll overflow-x-auto [touch-action:pan-x]">
        <table className="app-data-table w-max min-w-[1300px] text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="px-6 py-4">SR No</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Bill Number</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total GST</th>
              <th className="px-6 py-4">Items</th>
              {isAdmin && <th className="px-6 py-4">Created By</th>}
              <th className="px-6 py-4">Sub Total</th>
              <th className="px-6 py-4">Grand Total</th>
              <th className="px-6 py-4 text-center">View Invoice</th>
            </tr>
          </thead>

          <tbody>
            {recentBills.length > 0 ? (
              recentBills.map((bill: any, index: number) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4">{index + 1}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        bill.billStatus === "Paid"
                          ? "bg-[#ecfdf3] text-[#15803d]"
                          : "bg-[#fff1f2] text-[#dc2626]"
                      }`}
                    >
                      {bill.billStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4">{bill.billNumber}</td>

                  <td className="px-6 py-4">
                    {bill.items?.[0]?.productName || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {bill.items?.[0]?.company?.companyName || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {bill.createdAt
                      ? new Date(bill.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">Rs {bill.totalGST}</td>

                  <td className="px-6 py-4">{bill.items?.length}</td>

                  {isAdmin && (
                    <td className="px-6 py-4 text-[#7180a0]">
                      {bill.user?.name || "-"} <br />
                      {bill.user?.email || ""}
                    </td>
                  )}

                  <td className="px-6 py-4 font-semibold text-[#2f55d4]">
                    Rs {bill.subTotal}
                  </td>

                  <td className="px-6 py-4 font-semibold text-[#15803d]">
                    Rs {bill.grandTotal}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      className="rounded-lg border border-[#d7e1f0] p-2 text-[#2f55d4] transition hover:bg-[#edf3ff]"
                      onClick={() => navigate(ROUTES.BILL.VIEW_INVOICE.replace(":id", bill._id))}
                    >
                      <View size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdmin ? 12 : 11}
                  className="py-6 text-center text-[#7180a0]"
                >
                  No Recent Bills
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillRecentTable;
