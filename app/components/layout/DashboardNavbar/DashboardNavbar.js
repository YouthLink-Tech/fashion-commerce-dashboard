import ClientDashboardWrapper from "./ClientDashboardWrapper";
const DashboardNavbar = ({ children, sidebarState, isSidebarCollapsed,
  setIsSidebarCollapsed, isSidebarPinned, setIsSidebarPinned, isMobile }) => {
  return (
    <div className={`bg-gray-50 min-h-screen sidebar-${sidebarState}`}>

      {/* Sidebar and navigation */}
      <ClientDashboardWrapper
        sidebarState={sidebarState}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isSidebarPinned={isSidebarPinned}
        setIsSidebarPinned={setIsSidebarPinned}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div
        className={`flex-1 ${isMobile ? "" : "ml-[var(--sidebar-width)]"} ${isSidebarPinned ? "sidebar-pinned" : ""
          }`}
      >
        {children}
      </div>

    </div>
  );
};

export default DashboardNavbar;