import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/Routes";

type Props = {
  companies: any[];
  currentUserRole?: string;
};

const CompanyRecentTable = ({ companies = [], currentUserRole }: Props) => {
  const navigate = useNavigate();

  const isAdmin = currentUserRole === "admin";

  const recentCompanies = (companies || [])
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="app-table-card min-w-0 rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="flex items-center justify-between border-b border-[#e6ecf7] px-6 py-4">
        <h2 className="text-lg font-medium text-[#1f2f4f]">Companies</h2>
        <button
          onClick={() => navigate(ROUTES.COMPANY.GET_COMPANY)}
          className="flex items-center gap-2 text-sm text-[#2f55d4] transition hover:text-[#274bc0]"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="app-table-scroll overflow-x-auto [touch-action:pan-x]">
        <table className="app-data-table w-max min-w-[1080px] text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-6 py-4">Company</th>
              {isAdmin && <th className="whitespace-nowrap px-6 py-4">Added By</th>}
              <th className="whitespace-nowrap px-6 py-4">GST</th>
              <th className="whitespace-nowrap px-6 py-4">Phone</th>
              <th className="whitespace-nowrap px-6 py-4">Email</th>
              <th className="whitespace-nowrap px-6 py-4">City</th>
              <th className="whitespace-nowrap px-6 py-4">State</th>
              <th className="whitespace-nowrap px-6 py-4">Pincode</th>
            </tr>
          </thead>

          <tbody>
            {recentCompanies.length > 0 ? (
              recentCompanies.map((company: any) => (
                <tr key={company._id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2f4f]">{company.companyName}</td>

                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4 text-[#7180a0]">
                      {company.user?.name} <br />
                      {company.user?.email}
                    </td>
                  )}

                  <td className="whitespace-nowrap px-6 py-4">{company.gstNumber}</td>
                  <td className="whitespace-nowrap px-6 py-4">{company.phone}</td>
                  <td className="whitespace-nowrap px-6 py-4">{company.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">{company.city}</td>
                  <td className="whitespace-nowrap px-6 py-4">{company.state}</td>
                  <td className="whitespace-nowrap px-6 py-4">{company.pincode}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="py-6 text-center text-[#7180a0]">
                  No Recent Companies
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyRecentTable;
