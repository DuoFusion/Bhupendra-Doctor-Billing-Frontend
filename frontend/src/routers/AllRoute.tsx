import { Route, Routes } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Signin from "../pages/auth/Signin";
import OtpVerification from "../pages/auth/OtpVerification";
import Product from "../pages/global/Products";
import Companies from "../pages/global/Companies";
import Bills from "../pages/global/Bills";
import Category from "../pages/global/Category";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/authApi";
import { ROUTES } from "../constants/Routes";
import AddCompany from "../pages/global/AddCompany";
import AddProduct from "../pages/global/AddProduct";
import ManageUsers from "../pages/admin/ManageUsers";
import AddUser from "../pages/admin/AddUser";
import GenerateBill from "../pages/global/GenerateBill";
import InvoiceBill from "../pages/global/InvoiceBill";
import Dashboard from "../pages/global/Dashboard";
import Profile from "../pages/global/Profile";
import ResetForgetPassword from "../pages/auth/ResetForgetPassword";
import VerifyOtpAndChangePass from "../components/auth/VerifyOtpAndChangePass";
import ChangePassword from "../pages/auth/ChangePassword";

const AllRoute = () => {

  const {data} = useQuery({
    queryKey : ["currentUser"],
    queryFn : getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const role = data?.user?.role || null;
  const sharedRoutes = [
    { path: ROUTES.PRODUCTS.GET_PRODUCTS, element: <Product /> },
    { path: ROUTES.CATEGORY.GET_CATEGORIES, element: <Category /> },
    { path: ROUTES.COMPANY.GET_COMPANY, element: <Companies /> },
    { path: ROUTES.BILL.GET_BILLS, element: <Bills /> },
    { path: ROUTES.PRODUCTS.ADD_PRODUCT, element: <AddProduct /> },
    { path: ROUTES.CATEGORY.ADD_CATEGORY, element: <Category /> },
    { path: ROUTES.PRODUCTS.UPDATE_PRODUCT, element: <AddProduct /> },
    { path: ROUTES.COMPANY.ADD_COMPANY, element: <AddCompany /> },
    { path: ROUTES.COMPANY.UPDATE_COMPANY, element: <AddCompany /> },
    { path: ROUTES.BILL.GENERATE_BILL, element: <GenerateBill /> },
    { path: ROUTES.BILL.UPDATE_BILL, element: <GenerateBill /> },
    { path: ROUTES.BILL.VIEW_INVOICE, element: <InvoiceBill /> },
  ];

  return (
    <div>
      <Routes>

        {!role && (
          <>
            <Route path={ROUTES.AUTH.SIGNUP} element={<Signup />} />
            <Route path={ROUTES.AUTH.SIGNIN} element={<Signin />} />
            <Route path={ROUTES.AUTH.VERIFY_OTP} element={<OtpVerification />} />
            <Route path={ROUTES.AUTH.FORGET_PASSWORD} element={<ResetForgetPassword />} />
            <Route path={ROUTES.AUTH.OTP_VERIFY_RESET_PASSWORD} element={<VerifyOtpAndChangePass />} />
          </>
        )}

        {role === "admin" && (
          <>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            {sharedRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route path={ROUTES.ADMIN.MANAGE_USERS} element={<ManageUsers />} />
            <Route path={ROUTES.ADMIN.ADD_USERS} element={<AddUser />} />
            <Route path={ROUTES.ADMIN.UPDATE_USER} element={<AddUser />} />
            <Route path={ROUTES.ADMIN.PROFILE} element={<Profile />} />
            <Route path={ROUTES.AUTH.CHANGE_PASSWORD} element={<ChangePassword />} />
          </>
        )}

        {role === "user" && (
          <>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            {sharedRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route path={ROUTES.USER.PROFILE} element={<Profile />} />
            <Route path={ROUTES.AUTH.CHANGE_PASSWORD} element={<ChangePassword />} />
          </>
        )}

        <Route path={ROUTES.NOT_FOUND} element={<h1>404 Page Not Found</h1>} />

      </Routes>
    </div>
  );
};

export default AllRoute;
