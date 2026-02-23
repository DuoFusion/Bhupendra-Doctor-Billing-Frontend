import { Building2, Package, Receipt, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../../api/authApi";
import { getAllBills } from "../../../api/billApi";
import { getAllProducts } from "../../../api/productApi";
import { getAllCompanies } from "../../../api/companyApi";
import { getAllUsers } from "../../../api/userApi";
import BillRecentTable from "./BillRecentTable";
import ProductRecentTable from "./ProductRecentTable";
import CompanyRecentTable from "./CompanyRecentTable";
import UserRecentTable from "./UserRecentTable";

const MainDashboard = () => {
  const { data: currentUserData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const role = currentUserData?.user?.role;
  const { data: billsData } = useQuery({ queryKey: ["bills"], queryFn: getAllBills });
  const { data: productsData } = useQuery({ queryKey: ["products"], queryFn: getAllProducts });
  const { data: companiesData } = useQuery({ queryKey: ["companies"], queryFn: getAllCompanies });
  const { data: usersData } = useQuery({ queryKey: ["users"], queryFn: getAllUsers });

  const allBills = billsData?.bills || [];
  const allProducts = productsData?.products || [];
  const allCompanies = companiesData?.companies || [];
  const allUsers = usersData?.users || [];

  const currentUserId = currentUserData?.user?._id;

  const filteredBills = role === "admin" ? allBills : allBills.filter((b: any) => String(b.user?._id || b.user) === String(currentUserId));
  const filteredProducts = role === "admin" ? allProducts : allProducts.filter((p: any) => String(p.user?._id || p.user) === String(currentUserId));
  const filteredCompanies = role === "admin" ? allCompanies : allCompanies.filter((c: any) => String(c.user?._id || c.user) === String(currentUserId));
  const filteredUsers = role === "admin" ? allUsers : [];

  const totalBills = filteredBills.length;
  const totalProducts = filteredProducts.length;
  const totalCompanies = filteredCompanies.length;

  const cards = [
    { title: "Total Companies", value: totalCompanies, icon: Building2 },
    { title: "Total Products", value: totalProducts, icon: Package },
    { title: "Total Bills", value: totalBills, icon: Receipt },
    ...(role === "admin" ? [{ title: "Total Users", value: allUsers.length, icon: Users }] : []),
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] space-y-7 bg-transparent p-3 text-[#233456] sm:p-5 lg:p-6">
      <div className="rounded-2xl border border-[#d7e1f0] bg-white px-5 py-4 sm:px-6 sm:py-5">
        <h1 className="text-xl font-semibold text-[#1f2f4f] sm:text-2xl">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-[#6f7f9e]">Track products, companies, bills, and users in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-[#d7e1f0] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#5c6d8d]">{card.title}</p>
                <div className="rounded-lg border border-[#d6e1f5] bg-[#edf3ff] p-2.5 text-[#2f55d4]">
                  <Icon size={18} />
                </div>
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-[#1f2f4f]">{card.value}</h2>
            </div>
          );
        })}
      </div>

      {role === "admin" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <BillRecentTable bills={filteredBills} currentUserRole={role} />
            <UserRecentTable users={filteredUsers} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProductRecentTable products={filteredProducts} currentUserRole={role} />
            <CompanyRecentTable companies={filteredCompanies} currentUserRole={role} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <BillRecentTable bills={filteredBills} currentUserRole={role} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProductRecentTable products={filteredProducts} currentUserRole={role} />
            <CompanyRecentTable companies={filteredCompanies} currentUserRole={role} />
          </div>
        </>
      )}
    </div>
  );
};

export default MainDashboard;
