import React from "react";
import DashboardNavbar from "@/app/components/layout/DashboardNavbar/DashboardNavbar";
import SideNavbar from "@/app/components/layout/SideNavbar/SideNavbar";
// import InactivityHandlerWrapper from "../components/inactivity/InactivityHandlerWrapper";

const Layout = ({ children }) => {
  return (
    <div>
      {/* <InactivityHandlerWrapper /> */}
      {/* Only render sidebar on large devices */}
      <div className="inset-y-0 hidden flex-col xl:flex">
        <SideNavbar />
      </div>

      {/* Main content */}
      <div className="relative ml-0 xl:ml-[262px]">
        <DashboardNavbar />
        {children}
      </div>
    </div>
  );
};

export default Layout;