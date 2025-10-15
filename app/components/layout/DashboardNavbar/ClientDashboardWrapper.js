"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config/config";
import SideNavbar from "../SideNavbar/SideNavbar";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import DashboardWrapperLoading from "./DashboardWrapperLoading";

const ClientDashboardWrapper = ({ isSidebarCollapsed,
  setIsSidebarCollapsed, isSidebarPinned, setIsSidebarPinned }) => {
  const [isToggle, setIsToggle] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { existingUserData, isUserLoading } = useAuth();

  const handleClose = () => setIsToggle(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/user-access/logout`, null, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("initialPage");
    await signOut({ redirect: false });
    router.push("/auth/restricted-access");
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsToggle(false);
    };

    router?.events?.on("routeChangeStart", handleRouteChange);
    return () => {
      router?.events?.off("routeChangeStart", handleRouteChange);
    };
  }, [router?.events]);

  useEffect(() => {
    if (isToggle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isToggle]);

  // Show loading state if data is not loaded yet
  if (isUserLoading || !existingUserData || status === "loading") {
    return <DashboardWrapperLoading />;
  };

  return (
    <div className={`sidebar-${isSidebarCollapsed ? "collapsed" : "expanded"}`}>

      {/* Sidebar: Fixed on large screens, hidden on smaller screens */}
      <div className={`fixed inset-y-0 hidden xl:block xl:w-[var(--sidebar-width)] z-50`}>
        <SideNavbar isCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isSidebarPinned={isSidebarPinned}
          setIsSidebarPinned={setIsSidebarPinned}
        />
      </div>

      {/* Mobile sidebar: Toggled via MobileNavbar */}
      {isToggle && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black opacity-30 xl:hidden"
            onClick={handleClose}
          ></div>
          <div
            className="fixed inset-y-0 left-0 z-50 w-[262px] h-full bg-white shadow-lg transition-transform transform xl:hidden"
            style={{ transform: "translateX(0)" }}
          >
            <SideNavbar
              onClose={handleClose}
              isToggle={isToggle}
              isCollapsed={false} // Always expanded on mobile
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              isSidebarPinned={false} // No pinning on mobile
              setIsSidebarPinned={setIsSidebarPinned}
            />
          </div>
        </>
      )}

      {/* Navigation */}
      <DesktopNavbar
        session={session}
        status={status}
        existingUserData={existingUserData}
        handleLogout={handleLogout}
      />
      <MobileNavbar
        session={session}
        status={status}
        existingUserData={existingUserData}
        handleLogout={handleLogout}
        isToggle={isToggle}
        setIsToggle={setIsToggle}
      />
    </div>
  );
};

export default ClientDashboardWrapper;