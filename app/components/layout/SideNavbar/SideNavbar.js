"use client";
import { FaBullhorn, FaGlobeAsia } from "react-icons/fa";
import { PiUsersThreeLight, PiBookOpen } from "react-icons/pi";
import { BiCategory, BiPurchaseTagAlt, BiTransferAlt } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineLocationOn, MdOutlineInventory2, MdOutlinePolicy } from "react-icons/md";
import { TbBrandGoogleAnalytics, TbMessageCircleQuestion, TbClipboardList, TbBuildingBank, TbHomeCog, TbBrandAppleNews } from "react-icons/tb";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LiaUsersCogSolid, LiaPeopleCarrySolid } from "react-icons/lia";
import { IoColorPaletteOutline, IoSettingsOutline } from "react-icons/io5";
import { LuWarehouse, LuNewspaper } from "react-icons/lu";
import { BsTags } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { FiShoppingBag, FiBox } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/contexts/auth";
import { SidebarLoading } from "../../shared/Loading/SidebarLoading";
import { MdSupportAgent } from "react-icons/md";
import Logo from "./Logo";
import SideNavbarList from "./SideNavbarList";

const SideNavbar = ({ onClose }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);  // State for submenu
  const { data: session } = useSession();
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const getUserRoleForModule = (moduleName) => {
    return permissions.find(
      (group) => group.modules?.[moduleName]?.access === true
    )?.role;
  };
  const role1 = getUserRoleForModule("Product Hub");
  const role2 = getUserRoleForModule("Supply Chain");
  const isViewer1 = role1 === "Viewer";
  const isViewer2 = role2 === "Viewer";

  let hasRenderedOthers = false;

  // Show loading state if data is not loaded yet
  if (isUserLoading || !existingUserData) {
    return <SidebarLoading />;
  };

  const handleItemClick = (name) => {
    setActiveItem(activeItem === name ? null : name);
  };

  const handleSubItemClick = (subName) => {
    setActiveSubItem(activeSubItem === subName ? null : subName);
  };

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "-100%" }} // Starts off-screen (left side)
        animate={{ x: 0 }} // Moves in
        exit={{ x: "-100%", transition: { duration: 0.3 } }} // Moves out on close
        transition={{ duration: 0.3, ease: "easeInOut" }} className="h-screen w-[262px] fixed z-50 overflow-y-auto custom-scrollbar bg-white">

        <div className="px-4 transition-colors duration-1000 sticky top-0 pt-1.5 z-10 bg-white">
          <Logo />
          <hr style={{ border: "0.5px solid #ccc", margin: "8px 0" }} />
        </div>

        <SideNavbarList
          session={session}
          allList={allList}
          pathname={pathname}
          onClose={onClose}
          activeItem={activeItem}
          hasRenderedOthers={hasRenderedOthers}
          handleItemClick={handleItemClick}
          isViewer1={isViewer1}
          isViewer2={isViewer2}
          activeSubItem={activeSubItem}
          handleSubItemClick={handleSubItemClick}
        />

      </motion.div>
    </AnimatePresence>
  );
};

export default SideNavbar;