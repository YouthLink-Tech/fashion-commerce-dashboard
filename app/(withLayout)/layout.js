import React from "react";
import InactivityHandlerWrapper from "../components/inactivity/InactivityHandlerWrapper";
import SessionWatcher from "../components/SessionWatcher/SessionWatcher";
import SidebarStateWrapper from "../components/layout/SideNavbar/SidebarStateWrapper";
import { PermissionsSyncProvider } from "../components/permissions/PermissionsSyncProvider";

const Layout = ({ children }) => {
  return (
    <div>
      <InactivityHandlerWrapper />
      <SessionWatcher />
      <SidebarStateWrapper>
        <PermissionsSyncProvider>
          {children}
        </PermissionsSyncProvider>
      </SidebarStateWrapper>
    </div>
  );
};

export default Layout;