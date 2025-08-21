"use client";
import { useState, useEffect } from "react";
import DashboardNavbar from "../DashboardNavbar/DashboardNavbar";

const SidebarStateWrapper = ({ children }) => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Default to expanded
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    if (typeof window !== "undefined") {
      // Disable pinning on mobile (width < 1280px, Tailwind xl breakpoint)
      return window.innerWidth >= 1280;
    }
    return true; // Default to pinned for SSR (desktop)
  });
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 1280);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCollapsed = localStorage.getItem("sidebarCollapsed");
      if (storedCollapsed !== null) {
        setIsSidebarCollapsed(storedCollapsed === "true");
      }
      const storedPinned = localStorage.getItem("sidebarPinned");
      if (storedPinned !== null && !isMobile) {
        setIsSidebarPinned(storedPinned === "true");
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarPinned(false); // Disable pinning on mobile
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarPinned", isSidebarPinned.toString());
    }
  }, [isSidebarPinned, isMobile]);

  return (
    <div className={`sidebar-${isSidebarCollapsed ? "collapsed" : "expanded"}`}>
      <DashboardNavbar
        sidebarState={isSidebarCollapsed ? "collapsed" : "expanded"}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isSidebarPinned={isSidebarPinned}
        setIsSidebarPinned={setIsSidebarPinned}
        isMobile={isMobile}
      >
        {children}
      </DashboardNavbar>
    </div>
  );
};

export default SidebarStateWrapper;