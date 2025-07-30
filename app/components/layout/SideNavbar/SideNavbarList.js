import Link from 'next/link';
import React from 'react';
import { FaChevronRight, FaAngleDown } from "react-icons/fa6";
import { motion } from "framer-motion";

const SideNavbarList = ({ session, allList, pathname, onClose, activeItem, hasRenderedOthers, handleItemClick, isViewer1, isViewer2, activeSubItem, handleSubItemClick }) => {
  return (
    <div className={`flex flex-col mt-6 ${session ? "mb-8" : "mb-8"}`}>
      <h1 className="px-4 text-neutral-500 mb-4 font-medium">MAIN MENU</h1>

      {
        allList?.map((item, index) => {

          if (!item?.permission) return null;

          const isOtherItem = item?.name === "Customer Support" || item?.name === "Settings";
          const renderOthersHeading = isOtherItem && !hasRenderedOthers;

          if (renderOthersHeading) {
            hasRenderedOthers = true;
          }

          return item?.permission ? (

            <div key={index}>
              {renderOthersHeading && (
                <h1 className="px-4 text-neutral-500 mt-8 mb-4 font-medium">OTHERS</h1>
              )}
              <div
                onClick={(e) => {
                  if (item?.links) {
                    e.preventDefault(); // Prevent navigation
                    handleItemClick(item?.name);
                  }
                }}
                className={`${(pathname === item?.path || (item?.path !== '/' && pathname.startsWith(item?.path))) ||
                  (item.name === 'Settings' && (pathname === '/zone' || pathname.startsWith('/zone/add-shipping-zone')))
                  ? "text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]" : "text-black"} cursor-pointer`}>
                {!item.links ? (
                  <Link
                    href={item?.path}
                    onClick={onClose}
                    className="flex items-center gap-2 w-full hover:bg-[#E5F7F4] px-4 py-3 group"
                  >
                    {/* Icon */}
                    <h2 className={`p-1 text-base xl:text-lg 2xl:text-xl rounded-xl
    ${pathname === item?.path || (item?.path !== "/" && pathname.startsWith(item?.path))
                        ? "text-[#00B795]"
                        : "text-black group-hover:text-[#00B795]"}`}>
                      {item?.icon}
                    </h2>

                    {/* Name */}
                    <h2 className={`font-semibold text-neutral-600
    ${pathname === item?.path ||
                        (item?.path !== "/" && pathname.startsWith(item?.path))
                        ? "!text-[#00B795]"
                        : "text-black group-hover:text-[#00B795]"}`}>
                      {item?.name}
                    </h2>
                  </Link>


                ) : (
                  <div className={`flex items-center gap-2 w-full hover:bg-[#E5F7F4] hover:text-[#00B795] px-4 py-3 group`}>
                    <h2 className={`p-1 text-base xl:text-lg 2xl:text-xl rounded-xl ${pathname === item?.path || (item?.path !== "/" && pathname.startsWith(item?.path))
                      ? "text-[#00B795]" : "text-black group-hover:text-[#00B795]"}`}>
                      {item?.icon}
                    </h2>

                    {/* Name (Also changes color on hover & active state) */}
                    <h2 className={`font-semibold text-neutral-600 ${pathname === item?.path ||
                      (item?.path !== "/" && pathname.startsWith(item?.path))
                      ? "text-[#00B795]" : "text-black group-hover:text-[#00B795]"}`}>
                      {item?.name}
                    </h2>
                    <span className="ml-auto">
                      {activeItem === item?.name ? <FaAngleDown /> : <FaChevronRight />}
                    </span>
                  </div>
                )}
              </div>

              {/* Render links under Settings or Product Configuration */}
              {item?.links && activeItem === item?.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: activeItem === item.name ? "auto" : 0, opacity: activeItem === item.name ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }} className="flex flex-col items-center w-full">
                  {item?.links?.map((linkItem, linkIndex) => {

                    return (
                      linkItem?.links ? (
                        // Render nested Product Configuration
                        <div key={linkIndex} className="w-full">
                          <div
                            onClick={() => handleSubItemClick(linkItem?.name)}
                            className="flex items-center gap-6 w-full hover:bg-[#E5F7F4] cursor-pointer px-4 py-3 justify-between group"
                          >
                            <div className="flex pl-2 items-center justify-between gap-2">
                              <h2 className="p-1 text-base xl:text-lg 2xl:text-xl rounded-xl group-hover:text-[#00B795]">{linkItem?.icon}</h2>
                              <h2 className={`font-semibold text-neutral-600 group-hover:text-[#00B795]`}>{linkItem?.name}</h2>
                            </div>
                            <div className="group-hover:text-[#00B795]">
                              {activeSubItem === linkItem?.name ? <FaAngleDown /> : <FaChevronRight />}
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

                                return (
                                  <Link
                                    href={subLink.link}
                                    key={subIndex}
                                    onClick={onClose}
                                    className={`flex items-center gap-2 w-full hover:bg-[#E5F7F4] pl-8 py-3 group ${pathname === subLink.link
                                      ? "text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]"
                                      : "hover:text-[#00B795]"
                                      }`}
                                  >
                                    <h2 className="p-1 text-base xl:text-lg 2xl:text-xl rounded-xl">{subLink.icon}</h2>
                                    <h2
                                      className={`font-semibold text-neutral-600 group-hover:text-[#00B795] ${pathname === subLink.link ? "!text-[#00B795]" : ""
                                        }`}
                                    >
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
                          className={`flex pl-6 items-center gap-2 w-full hover:bg-[#E5F7F4] group py-3 ${pathname === linkItem.link
                            ? "text-[#00B795] bg-[#E5F7F4] border-l-5 border-[#00B795]"
                            : "hover:text-[#00B795]"
                            }`}
                        >
                          <h2 className="p-1 text-base xl:text-lg 2xl:text-xl rounded-xl">{linkItem.icon}</h2>
                          <h2
                            className={`font-semibold text-neutral-600 group-hover:text-[#00B795] ${pathname === linkItem.link ? "!text-[#00B795]" : ""
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