import React from "react";
import InactivityHandlerWrapper from "../components/inactivity/InactivityHandlerWrapper";
import SessionWatcher from "../components/SessionWatcher/SessionWatcher";
import SidebarStateWrapper from "../components/layout/SideNavbar/SidebarStateWrapper";

const Layout = ({ children }) => {
  return (
    <div>
      <InactivityHandlerWrapper />
      <SessionWatcher />
      <SidebarStateWrapper>{children}</SidebarStateWrapper>
    </div>
  );
};

export default Layout;