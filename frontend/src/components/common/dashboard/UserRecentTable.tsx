import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/Routes";

type Props = {
  users: any[];
};

const UserRecentTable = ({ users = [] }: Props) => {
  const navigate = useNavigate();

  const recentUsers = (users || [])
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="app-table-card min-w-0 rounded-2xl border border-[#d7e1f0] bg-white">
      <div className="flex items-center justify-between border-b border-[#e6ecf7] px-6 py-4">
        <h2 className="text-lg font-medium text-[#1f2f4f]">Users</h2>
        <button
          onClick={() => navigate(ROUTES.ADMIN.MANAGE_USERS)}
          className="flex items-center gap-2 text-sm text-[#2f55d4] transition hover:text-[#274bc0]"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="app-table-scroll overflow-x-auto [touch-action:pan-x]">
        <table className="app-data-table w-max min-w-[760px] text-left text-sm text-[#3e5175]">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-6 py-4">Name</th>
              <th className="whitespace-nowrap px-6 py-4">Email</th>
              <th className="whitespace-nowrap px-6 py-4">Role</th>
            </tr>
          </thead>

          <tbody>
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2f4f]">{user.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        user.role === "admin"
                          ? "bg-[#edf3ff] text-[#2f55d4]"
                          : "bg-[#ecfdf3] text-[#15803d]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-6 text-center text-[#7180a0]">
                  No Recent Users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRecentTable;
