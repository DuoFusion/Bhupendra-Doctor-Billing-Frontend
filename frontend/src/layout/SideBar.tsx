import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Building2,
  LogIn,
  UserPlus,
  X,
  UserCircle,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { ROUTES } from "../constants/Routes";

interface SideBarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar: React.FC<SideBarProps> = ({
  open,
  setOpen,
  collapsed,
  setCollapsed,
}) => {
  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const role = data?.user?.role || null;

  const adminMenu = [
    { id: 1, text: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { id: 2, text: "Products", path: ROUTES.PRODUCTS.GET_PRODUCTS, icon: <Package size={18} /> },
    { id: 3, text: "Company", path: ROUTES.COMPANY.GET_COMPANY, icon: <Building2 size={18} /> },
    { id: 4, text: "Bills", path: ROUTES.BILL.GET_BILLS, icon: <FileText size={18} /> },
    { id: 5, text: "Category", path: ROUTES.CATEGORY.GET_CATEGORIES, icon: <Tags size={18} /> },
    { id: 6, text: "Users", path: ROUTES.ADMIN.MANAGE_USERS, icon: <UserPlus size={18} /> },
  ];

  const userMenu = [
    { id: 6, text: "Dashboard", path: ROUTES.USER.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { id: 7, text: "Products", path: ROUTES.PRODUCTS.GET_PRODUCTS, icon: <Package size={18} /> },
    { id: 8, text: "Company", path: ROUTES.COMPANY.GET_COMPANY, icon: <Building2 size={18} /> },
    { id: 9, text: "Bills", path: ROUTES.BILL.GET_BILLS, icon: <FileText size={18} /> },
    { id: 10, text: "Category", path: ROUTES.CATEGORY.GET_CATEGORIES, icon: <Tags size={18} /> },
  ];

  const guestMenu = [
    { id: 10, text: "Sign In", path: ROUTES.AUTH.SIGNIN, icon: <LogIn size={18} /> },
    { id: 11, text: "Sign Up", path: ROUTES.AUTH.SIGNUP, icon: <UserPlus size={18} /> },
  ];

  const menu = role === "admin" ? adminMenu : role === "user" ? userMenu : guestMenu;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-[#0f172a]/35 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-[#d6dfef] bg-white/95 text-[#2a3f61] backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-5">
          <div className="mb-8 flex items-center justify-between">
            <h2 className={`font-semibold tracking-wide text-[#2f55d4] ${collapsed ? "text-2xl lg:text-xl" : "text-2xl"}`}>
              {collapsed ? (
                <>
                  <span className="lg:hidden">Medico</span>
                  <span className="hidden lg:inline">M</span>
                </>
              ) : (
                "Medico"
              )}
            </h2>

            <div className="flex items-center gap-2">
              <button
                className="hidden rounded-lg border border-[#d6dfef] bg-[#f8faff] p-1.5 text-[#4f6285] transition hover:border-[#2f55d4] hover:text-[#2f55d4] lg:inline-flex"
                onClick={() => setCollapsed((prev) => !prev)}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>

              <button
                className="rounded-lg border border-[#d6dfef] bg-[#f8faff] p-1.5 text-[#4f6285] transition hover:border-[#2f55d4] hover:text-[#2f55d4] md:hidden"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 text-sm font-medium transition-colors duration-200 ${
                    collapsed ? "gap-3 px-4 lg:justify-center lg:px-2" : "gap-3 px-4"
                  } ${
                    isActive
                      ? "border border-[#c7d4f1] bg-[#edf3ff] text-[#2f55d4]"
                      : "border border-transparent text-[#5a6c8d] hover:bg-[#f4f7ff] hover:text-[#2f55d4]"
                  }`
                }
                title={collapsed ? item.text : undefined}
              >
                {item.icon}
                <span className={collapsed ? "lg:hidden" : ""}>{item.text}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {role && (
          <div className="border-t border-[#d6dfef] p-4">
            <NavLink
              to={ROUTES.USER.PROFILE}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-2 py-2 transition ${
                  isActive ? "bg-[#f4f7ff]" : "hover:bg-[#f4f7ff]"
                }`
              }
            >
              <div className={`flex items-center rounded-lg p-2 ${collapsed ? "gap-3 lg:justify-center" : "gap-3"}`}>
                <UserCircle size={28} className="text-[#5a6c8d]" />
                <p className={`text-sm font-medium uppercase tracking-[0.1em] text-[#334a71] ${collapsed ? "lg:hidden" : ""}`}>
                  {data?.user?.name}
                </p>
              </div>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
};

export default SideBar;
