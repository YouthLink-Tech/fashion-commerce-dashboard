"use client";
import { FaBullhorn, FaChevronLeft, FaGlobeAsia, FaThumbtack } from "react-icons/fa";
import { PiUsersThreeLight, PiBookOpen } from "react-icons/pi";
import { BiCategory, BiPurchaseTagAlt, BiTransferAlt } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineLocationOn, MdOutlineInventory2, MdOutlinePolicy } from "react-icons/md";
import { TbBrandGoogleAnalytics, TbMessageCircleQuestion, TbClipboardList, TbBuildingBank, TbHomeCog, TbBrandAppleNews } from "react-icons/tb";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LiaUsersCogSolid, LiaPeopleCarrySolid } from "react-icons/lia";
import { IoColorPaletteOutline, IoSettingsOutline } from "react-icons/io5";
import { LuWarehouse, LuNewspaper } from "react-icons/lu";
import { BsTags } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { FiShoppingBag, FiBox, FiShoppingCart, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { SidebarLoading } from "../../shared/Loading/SidebarLoading";
import { MdSupportAgent } from "react-icons/md";
import Logo from "./Logo";
import SideNavbarList from "./SideNavbarList";
import { useUserPermissions } from "@/app/hooks/useUserPermissions";

const SideNavbar = ({ onClose, isCollapsed, setIsSidebarCollapsed, isToggle, isSidebarPinned, setIsSidebarPinned }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);  // State for submenu
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const { data: session } = useSession();
  const { isUserLoading, getRoleForModule, permissions } = useUserPermissions();
  const role1 = getRoleForModule("Product Hub");  // Returns "Viewer" or null
  const role2 = getRoleForModule("Supply Chain");  // Same for multiple calls
  const isViewer1 = role1 === "Viewer";
  const isViewer2 = role2 === "Viewer";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1280;
  let hasRenderedOthers = false;

  const checkPermission = (label) => {
    if (!permissions || !Array.isArray(permissions)) return false;

    for (const group of permissions) {
      if (
        group.modules &&
        group.modules[label] &&
        group.modules[label].access === true
      ) {
        return true;
      }
    }

    return false;
  };

  const allList = [
    {
      name: "Dashboard",
      icon: <RxDashboard />,
      path: "/dashboard",
      permission: checkPermission("Dashboard"),
    },
    {
      name: "Orders",
      icon: <TbClipboardList />,
      path: "/orders",
      permission: checkPermission("Orders"),
    },
    {
      name: "Product Hub",
      icon: <FiBox />,
      path: "/product-hub",
      permission: checkPermission("Product Hub"),
      links: [
        {
          label: "Manage Products",
          link: "/product-hub/products",
          icon: <FiShoppingBag />,
        },
        {
          label: "Inventory",
          link: "/product-hub/inventory",
          icon: <MdOutlineInventory2 />,
        },
        {
          label: "Purchase Orders",
          link: "/product-hub/purchase-orders",
          icon: <BiPurchaseTagAlt />,
        },
        {
          label: "Transfers",
          link: "/product-hub/transfers",
          icon: <BiTransferAlt />,
        },
        {
          name: "Product Settings",
          icon: <IoSettingsOutline />,
          links: [
            {
              label: "Categories",
              link: "/product-hub/categories",
              icon: <BiCategory />,
            },
            {
              label: "Seasons",
              link: "/product-hub/seasons",
              icon: <FaGlobeAsia />,
            },
            {
              label: "Colors",
              link: "/product-hub/colors",
              icon: <IoColorPaletteOutline />,
            },
            {
              label: "Vendors",
              link: "/product-hub/vendors",
              icon: <LuWarehouse />,
            },
            {
              label: "Tags",
              link: "/product-hub/tags",
              icon: <BsTags />,
            },
          ],
        },
      ],
    },
    {
      name: "Customers",
      icon: <PiUsersThreeLight />,
      path: "/customers",
      permission: checkPermission("Customers"),
    },
    {
      name: "Finances",
      icon: <TbBuildingBank />,
      path: "/finances",
      permission: checkPermission("Finances"),
      links: [
        {
          label: "Sales",
          link: "/finances/sales",
          icon: <FiShoppingCart />,
        },
        {
          label: "Expenses",
          link: "/finances/expenses",
          icon: <FiTrendingDown />,
        },
        {
          label: "Payment Methods",
          link: "/finances/payment-methods",
          icon: <FiCreditCard />,
        }
      ]
    },
    {
      name: "Analytics",
      icon: <TbBrandGoogleAnalytics />,
      path: "/analytics",
      permission: checkPermission("Analytics"),
    },
    {
      name: "Marketing",
      icon: <FaBullhorn />,
      path: "/marketing",
      permission: checkPermission("Marketing")
    },
    {
      name: "Supply Chain",
      icon: <LiaPeopleCarrySolid />,
      path: "/supply-chain",
      permission: checkPermission("Supply Chain"),
      links: [
        {
          label: "Shipment",
          link: "/supply-chain/zone",
          icon: <CiDeliveryTruck />,
        },
        {
          label: "Locations",
          link: "/supply-chain/locations",
          icon: <MdOutlineLocationOn />,
        }
      ]
    },
    {
      name: "Customer Support",
      icon: <MdSupportAgent />,
      path: "/customer-support",
      permission: checkPermission("Marketing")
    },
    {
      name: "Settings",
      icon: <IoSettingsOutline />,
      permission: checkPermission("Settings"),
      path: "/settings",
      links: [
        { label: "User Management", link: "/settings/enrollment", icon: <LiaUsersCogSolid /> },
        { label: "Homepage", link: "/settings/homepage", icon: <TbHomeCog /> },
        { label: "Brand", link: "/settings/brand", icon: <TbBrandAppleNews /> },
        {
          name: "Legal Policies",
          icon: <LuNewspaper />,
          links: [
            { label: "Policy Pages", link: "/settings/policy-pages", icon: <MdOutlinePolicy /> },
            { label: "Story", link: "/settings/our-story", icon: <PiBookOpen /> },
            { label: "FAQ", link: "/settings/faq", icon: <TbMessageCircleQuestion /> },
          ],
        },
      ],
    },
  ];

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(!isCollapsed);
      if (isSidebarPinned) {
        setIsSidebarPinned(false);
        setIsHoverEnabled(false);
      }
    }
  };

  const togglePin = () => {
    if (isMobile) return;
    if (isSidebarPinned) {
      setIsSidebarPinned(false);
      setIsSidebarCollapsed(true);
      setIsHoverEnabled(false);
    } else {
      setIsSidebarPinned(true);
      setIsSidebarCollapsed(false);
      setIsHoverEnabled(true);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isSidebarPinned && isCollapsed && isHoverEnabled) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isSidebarPinned && !isCollapsed) {
      setIsSidebarCollapsed(true);
    }
  };

  // Re-enable hover after a short delay
  useEffect(() => {
    if (!isHoverEnabled) {
      const timer = setTimeout(() => {
        setIsHoverEnabled(true);
      }, 300); // Adjust delay as needed (300ms is usually enough for the animation)
      return () => clearTimeout(timer);
    }
  }, [isHoverEnabled]);

  if (isMobile && !isToggle) {
    return null;
  }

  // Show loading state if data is not loaded yet
  if (isUserLoading) {
    return <SidebarLoading />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          width: isSidebarPinned ? (isCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width-expanded)") : (isCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width-expanded)"),
        }}
        animate={{
          width: isSidebarPinned ? (isCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width-expanded)") : (isCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width-expanded)"),
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`h-screen z-60 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white ${isSidebarPinned ? "" : "sidebar-unpinned"} sidebar-${isCollapsed ? "collapsed" : "expanded"} border`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <div className="px-4 transition-colors duration-1000 sticky top-0 pt-1.5 z-10 bg-white">
          <div className="flex items-center justify-between">

            {/* Left: Logo */}
            <Logo isCollapsed={isCollapsed && !isMobile} />

            {/* Right: Buttons */}
            {!isToggle && !isMobile && (
              <div className="flex items-center gap-2 absolute right-1">
                {isSidebarPinned && (
                  <button
                    onClick={toggleCollapse}
                    className="p-1.5 hover:text-white hover:bg-black text-black bg-white drop-shadow rounded-full"
                  >
                    <FaChevronLeft size={15}
                      className={`transform ${isCollapsed ? "rotate-180" : ""}`}
                    />
                  </button>
                )}

                {!isSidebarPinned && !isCollapsed && (
                  <button
                    onClick={togglePin}
                    className="p-1.5 hover:text-white hover:bg-black text-black bg-white drop-shadow rounded-full"
                  >
                    <FaThumbtack size={15} />
                  </button>
                )}
              </div>
            )}

          </div>

          <hr className="border-t border-gray-300 my-2" />
        </div>

        <SideNavbarList
          session={session}
          allList={allList}
          pathname={pathname}
          onClose={onClose}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          hasRenderedOthers={hasRenderedOthers}
          isViewer1={isViewer1}
          isViewer2={isViewer2}
          activeSubItem={activeSubItem}
          setActiveSubItem={setActiveSubItem}
          isCollapsed={isCollapsed && !isMobile}
        />

      </motion.div>
    </AnimatePresence>
  );
};

export default SideNavbar;