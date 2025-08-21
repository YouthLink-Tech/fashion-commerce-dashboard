import Link from 'next/link';
import React from 'react';
import { FaChevronRight, FaAngleDown } from "react-icons/fa6";
import { motion } from "framer-motion";

const SideNavbarList = ({ session, allList, pathname, onClose, activeItem, setActiveItem, hasRenderedOthers, isViewer1, isViewer2, activeSubItem, setActiveSubItem, isCollapsed }) => {

  // Helper function to determine if a route is active
  const isNavItemActive = (path) => {
    if (!path) return false;
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  return (
    <div className={`flex flex-col mt-6 ${session ? "mb-8" : "mb-8"}`}>
      {!isCollapsed && (
        <h1 className="px-4 text-neutral-500 mb-4 font-medium">MAIN MENU</h1>
      )}

      {
        allList?.map((item, index) => {

          if (!item?.permission) return null;

          const isOtherItem = item?.name === "Customer Support" || item?.name === "Settings";
          const renderOthersHeading = isOtherItem && !hasRenderedOthers;

          if (renderOthersHeading) {
            hasRenderedOthers = true;
          }

          // Determine active state for top-level item
          const isItemActive = isNavItemActive(item?.path);

          return item?.permission ? (

            <div key={index}>
              {(renderOthersHeading && !isCollapsed) && (
                <h1 className="px-4 text-neutral-500 mt-8 mb-4 font-medium">OTHERS</h1>
              )}
              <div
                onClick={(e) => {
                  if (item?.links) {
                    e.preventDefault();
                    setActiveItem(activeItem === item?.name ? null : item?.name);
                  }
                }}
                className={`${isItemActive ? "text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]" : "text-black"
                  } cursor-pointer`}>
                {!item.links ? (
                  <Link
                    href={item?.path}
                    onClick={onClose}
                    className={`flex items-center gap-2 w-full hover:bg-[#E5F7F4] px-4 py-3 group ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Icon */}
                    <h2 className={`p-1 text-base xl:text-lg 2xl:text-xl rounded-xl ${isItemActive ? "text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                      }`}>
                      {item?.icon}
                    </h2>

                    {/* Name */}
                    {!isCollapsed && (
                      <h2 className={`font-semibold text-neutral-600 ${isItemActive ? "!text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                        }`}>
                        <span>{item.name}</span>
                      </h2>
                    )}
                  </Link>
                ) : (
                  <div className={`flex items-center gap-2 w-full hover:bg-[#E5F7F4] hover:text-[#00B795] px-4 py-3 group`}>
                    <h2 className={`p-1 text-base xl:text-lg 2xl:text-xl rounded-xl ${isItemActive ? "text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                      }`}>
                      {item?.icon}
                    </h2>

                    {/* Name (Also changes color on hover & active state) */}
                    {!isCollapsed &&
                      <>
                        <h2 className={`font-semibold text-neutral-600 ${isItemActive ? "!text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                          }`}>
                          <span>{item.name}</span>
                        </h2>
                        <span className="ml-auto">
                          {activeItem === item?.name ? <FaAngleDown /> : <FaChevronRight />}
                        </span>
                      </>
                    }
                  </div>
                )}
              </div>

              {/* Render links under Settings or Product Configuration */}
              {item?.links && activeItem === item?.name && !isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: activeItem === item.name ? "auto" : 0, opacity: activeItem === item.name ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }} className="flex flex-col items-center w-full">
                  {item?.links?.map((linkItem, linkIndex) => {

                    // Determine active state for submenu item
                    const isLinkActive = isNavItemActive(linkItem.link);

                    return (
                      linkItem?.links ? (
                        // Render nested Product Configuration
                        <div key={linkIndex} className="w-full">
                          <div
                            onClick={() => setActiveSubItem(activeSubItem === linkItem?.name ? null : linkItem?.name)}
                            className={`flex items-center gap-6 w-full hover:bg-[#E5F7F4] cursor-pointer px-4 py-3 justify-between group ${isLinkActive ? "text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]" : ""
                              }`}
                          >
                            <div className="flex pl-2 items-center justify-between gap-2">
                              <h2 className={`p-1 text-base xl:text-lg 2xl:text-xl rounded-xl ${isLinkActive ? "text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                                }`}>
                                {linkItem?.icon}
                              </h2>
                              <h2 className={`font-semibold text-neutral-600 ${isLinkActive ? "!text-[#00B795]" : "text-black group-hover:text-[#00B795]"
                                }`}>
                                {linkItem?.name}
                              </h2>
                            </div>
                            <div className="group-hover:text-[#00B795]">
                              {!isCollapsed && (activeSubItem === linkItem?.name ? <FaAngleDown /> : <FaChevronRight />)}
                            </div>
                          </div>

                          {/* Render links under Product Configuration */}
                          {linkItem?.links && activeSubItem === linkItem?.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: activeSubItem === linkItem.name ? "auto" : 0, opacity: activeSubItem === linkItem.name ? 1 : 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }} className="flex flex-col items-center w-full">
                              {linkItem?.links?.map((subLink, subIndex) => {

                                // if (item?.name !== "Settings" && !subLink.permission) return null;
                                const isSubLinkActive = isNavItemActive(subLink.link);

                                return (
                                  <Link
                                    href={subLink.link}
                                    key={subIndex}
                                    onClick={onClose}
                                    className={`flex items-center gap-2 w-full hover:bg-[#E5F7F4] pl-8 py-3 group ${isSubLinkActive
                                      ? 'text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]'
                                      : 'hover:text-[#00B795]'
                                      }`}
                                  >
                                    <h2 className="p-1 text-base xl:text-lg 2xl:text-xl rounded-xl">{subLink.icon}</h2>
                                    <h2 className={`font-semibold text-neutral-600 group-hover:text-[#00B795] ${isSubLinkActive ? '!text-[#00B795]' : ''
                                      }`}>
                                      {subLink.label}
                                    </h2>
                                  </Link>

                                )
                              })}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        // Render regular links in Product Hub or Settings
                        <Link
                          key={linkIndex}
                          href={
                            isViewer1 && linkItem.link === "/product-hub/products"
                              ? "/product-hub/products/existing-products"
                              : isViewer2 && linkItem.link === "/supply-chain/zone"
                                ? "/supply-chain/zone/existing-zones"
                                : linkItem.link
                          }
                          onClick={onClose}
                          className={`flex pl-6 items-center gap-2 w-full hover:bg-[#E5F7F4] group py-3 ${isLinkActive ? 'text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]' : 'hover:text-[#00B795]'
                            }`}
                        >
                          <h2 className="p-1 text-base xl:text-lg 2xl:text-xl rounded-xl">{linkItem.icon}</h2>
                          <h2
                            className={`font-semibold text-neutral-600 group-hover:text-[#00B795] ${isLinkActive ? '!text-[#00B795]' : ''
                              }`}
                          >
                            {linkItem.label}
                          </h2>
                        </Link>

                      )
                    )
                  }
                  )}
                </motion.div>
              )}

            </div>

          ) : null
        }
        )
      }
    </div>
  );
};

export default SideNavbarList;