import { useState } from "react";
import SideBar from "./SideBar";
import Navbar from "./Navbar";
import AllRoute from "../routers/AllRoute";
import Footer from "./Footer";

const Layout = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-light-theme relative flex min-h-screen overflow-hidden bg-[#eef3fa] text-[#24395d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-30%,rgba(95,135,230,0.25),transparent_42%),radial-gradient(circle_at_120%_0%,rgba(120,157,238,0.15),transparent_35%)]" />

      <SideBar
        open={open}
        setOpen={setOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`relative z-10 ml-0 flex min-h-screen flex-1 flex-col overflow-hidden md:ml-64 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <Navbar setOpen={setOpen} collapsed={collapsed} />

        <main className="flex-1 overflow-auto px-4 pb-8 pt-20 sm:px-6 lg:px-8">
          <AllRoute />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
