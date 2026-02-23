import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, signout } from "../api/authApi";
import { routes } from "../routers/RouteConfig";
import { ROUTES } from "../constants/Routes";
import { useConfirm } from "../components/common/confirm/ConfirmProvider";
import { getApiErrorMessage, notify } from "../utils/notify";

interface NavbarProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ setOpen, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentRoute = routes.find((route) => route.path === location.pathname);
  const title = currentRoute?.title || "Page";

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { mutate: signoutUser, isPending } = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.cancelQueries({ queryKey: ["currentUser"] });
      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["bills"], { bills: [] });
      queryClient.setQueryData(["products"], { products: [] });
      queryClient.setQueryData(["companies"], { companies: [] });
      queryClient.setQueryData(["users"], { users: [] });
      notify.success("Signed out successfully");
      navigate(ROUTES.AUTH.SIGNIN);
    },
    onError: (err: unknown) => {
      notify.error(getApiErrorMessage(err, "Sign out failed"));
    },
  });

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const userName = data?.user?.name || "Profile";
  const initial = userName?.charAt(0)?.toUpperCase() || "U";
  const isAuthenticated = Boolean(data?.user?._id || data?.user?.email);

  useEffect(() => {
    if (!isAuthenticated && showMenu) {
      setShowMenu(false);
    }
  }, [isAuthenticated, showMenu]);

  const handleLogout = async () => {
    if (isPending) return;
    const shouldLogout = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (!shouldLogout) return;
    setShowMenu(false);
    signoutUser();
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 border-b border-[#d9e3f3] bg-white/90 backdrop-blur-xl md:left-64 ${
        collapsed ? "lg:left-20" : "lg:left-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-[#d1dcee] bg-[#f8faff] p-2 text-[#32518e] transition hover:border-[#2f55d4] hover:text-[#2f55d4] md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h1 className="text-base font-medium tracking-wide text-[#1f2f4f] sm:text-lg">
            {title}
          </h1>
        </div>

        {isAuthenticated && (
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 rounded-xl border border-[#d7e1f0] bg-[#f8faff] px-2.5 py-1.5 text-[#425478] transition hover:text-[#2f55d4]"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f55d4] text-sm text-white">
                {data?.user ? initial : <UserCircle size={17} />}
              </span>
              <span className="hidden max-w-[120px] truncate text-sm md:block">{userName}</span>
              <ChevronDown size={16} className={`transition ${showMenu ? "rotate-180" : ""}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-[#d7e1f0] bg-white p-1.5">
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#364867] transition hover:bg-[#f1f5ff]"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(ROUTES.USER.PROFILE);
                  }}
                >
                  Profile
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#364867] transition hover:bg-[#fff1f1] hover:text-[#dc2626]"
                  onClick={handleLogout}
                  disabled={isPending}
                >
                  <LogOut size={15} />
                  {isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
