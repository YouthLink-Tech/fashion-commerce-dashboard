import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GrNotification } from 'react-icons/gr';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { RxCross2 } from 'react-icons/rx';
import { GoDotFill } from "react-icons/go";
import useNotifications from '@/app/hooks/useNotifications';
import { getTimeAgo } from './GetTimeAgo';
import NotificationLoading from '../shared/Loading/NotificationLoading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useAuth } from '@/app/contexts/auth';
import { useSession } from 'next-auth/react';

const Notifications = () => {

  const [notificationList, isNotificationPending, refetch] = useNotifications();
  const [existingCustomerSupport, setExistingCustomerSupport] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productId, setProductId] = useState({}); // Store the fetched product names
  const axiosSecure = useAxiosSecure();
  const [showAll, setShowAll] = useState(false);
  const [showAll2, setShowAll2] = useState(false);
  const [activeTab, setActiveTab] = useState("stock");
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [filter2, setFilter2] = useState("all"); // 'all' or 'unread'
  const { existingUserData, isUserLoading } = useAuth();
  const { data: session, status } = useSession();

  const displayedNotifications = useMemo(() => {
    let baseList;

    if (filter === "unread") {
      baseList = notificationList?.filter(n => !n.isRead);
    } else if (filter === "done") {
      baseList = notificationList?.filter(n => n.notified);
    } else {
      baseList = notificationList;
    }

    if (!showAll) {
      baseList = baseList?.slice(0, 5);
    }

    return baseList;
  }, [showAll, notificationList, filter]);

  const fetchCustomerSupportNotifications = useCallback(async () => {
    try {
      const res = await axiosSecure.get(`/assigned-notifications-customer-support/${existingUserData._id}`);
      setExistingCustomerSupport(res.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Error fetching category data.');
    }
  }, [axiosSecure, existingUserData._id]); // Dependencies

  useEffect(() => {
    if (!existingUserData._id || status !== "authenticated" || !session?.user?.accessToken) return;
    fetchCustomerSupportNotifications();
  }, [existingUserData._id, status, session?.user?.accessToken, fetchCustomerSupportNotifications]);

  const displayedInboxes = useMemo(() => {
    let baseList;

    if (filter2 === "unread") {
      baseList = existingCustomerSupport?.filter(n => !n.isRead);
    } else {
      baseList = existingCustomerSupport;
    }

    if (!showAll2) {
      baseList = baseList?.slice(0, 5);
    }

    return baseList;
  }, [showAll2, existingCustomerSupport, filter2]);

  const unreadCount = useMemo(() => {
    return notificationList?.filter(n => !n.isRead)?.length || 0;
  }, [notificationList]);

  const unreadCustomerSupportCount = useMemo(() => {
    return existingCustomerSupport?.filter(n => !n.isRead)?.length || 0;
  }, [existingCustomerSupport]);

  const totalUnreadCount = useMemo(() => {
    return unreadCount + unreadCustomerSupportCount;
  }, [unreadCount, unreadCustomerSupportCount]);

  const notifiedCount = useMemo(() => {
    return notificationList?.filter(n => n.notified)?.length || 0;
  }, [notificationList]);

  const handleNotificationClick = async (detail) => {

    try {
      const notificationDetails = {
        type: detail.type,
        orderNumber: detail.orderNumber,
        productId: detail.productId,
        dateTime: detail.dateTime,
        email: detail.email,
        orderStatus: detail.orderStatus
      };

      const response = await axiosSecure.post("/mark-notification-read", notificationDetails)
      if (response?.data?.message === "Notification marked as read") {
        refetch();
      }

      // 2. Open appropriate page in a new tab
      if (detail.type === "Ordered") {
        const query = new URLSearchParams({
          orderNumber: detail.orderNumber,
          orderStatus: detail.orderStatus,
        }).toString();
        window.open(`/orders?${query}`, "_blank");
      }

      if (detail.type === "Notified") {
        const query = new URLSearchParams({
          productId: productId[detail.productId],
        }).toString();
        window.open(`/product-hub/inventory?${query}`, "_blank");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick2 = async (detail) => {
    try {
      const res = await axiosSecure.patch(`/mark-support-notification-read/${detail._id}`, {
        userId: existingUserData?._id,
      });

      if (res.data.success === true) {
        await fetchCustomerSupportNotifications();
      }

      const query = new URLSearchParams({ selectedMessageId: detail._id }).toString();
      window.open(`/customer-support?${query}`, "_blank");

    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        const productIds = notificationList
          ?.filter(item => item.type === "Notified")
          .map(item => item.productId);

        if (!productIds || productIds.length === 0) return;

        const response = await axiosSecure.post('/getProductIds', { ids: productIds });

        if (response.status === 200) {
          const productNamesMap = response.data.reduce((acc, product) => {
            acc[product._id] = product?.productId;
            return acc;
          }, {});
          setProductId(productNamesMap);
        } else {
          console.error('Failed to fetch product ids:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching product ids:', error);
      }
    };

    fetchProductNames();
  }, [notificationList, axiosSecure]);

  if (isNotificationPending || isUserLoading || status === "loading") return <NotificationLoading />;

  return (
    <Dropdown isOpen={isDropdownOpen} className='p-0' showArrow offset={10} placement="bottom-end"
      onOpenChange={(open) => {
        setIsDropdownOpen(open);
        if (!open) {
          setShowAll(false); // Reset state on close
          setShowAll2(false); // Reset state on close
          setFilter("all");
        }
      }}>
      <DropdownTrigger>
        <div className="relative">
          <GrNotification className='text-neutral-500 border rounded-full p-2 hover:text-neutral-700 cursor-pointer hover:bg-gray-100' size={36} />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalUnreadCount}
            </span>
          )}
        </div>
      </DropdownTrigger>

      <DropdownMenu closeOnSelect={false} aria-label="Static Actions" variant="flat" className="p-0 md:w-[500px]">

        <DropdownItem textValue="Notifications Section" className='hover:!bg-white cursor-default' isReadOnly>
          <div className='flex justify-between p-0 w-full'>
            <div className="flex flex-col px-2">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <h2 className="text-sm text-neutral-600">Stay updated with your latest notifications</h2>
            </div>
            <button onClick={() => {
              setIsDropdownOpen(false);
              setShowAll(false);
              setShowAll2(false);
            }} className="text-gray-500 hover:text-black hover:cursor-pointer">
              <RxCross2 size={24} />
            </button>
          </div>
        </DropdownItem>

        <DropdownItem textValue="Filter Section" isReadOnly className='p-0'>
          <div className="flex items-center justify-between px-2.5 pt-2 pb-2 border-t bg-white">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab("stock")}
                className={`px-[14px] py-1.5 rounded-md text-sm transition ${activeTab === "stock" ? "bg-green-100 text-green-800 font-semibold" : "text-gray-600 hover:text-black"
                  }`}
              >
                Stock
              </button>
              <button
                onClick={() => setActiveTab("customer support")}
                className={`px-[14px] py-1.5 rounded-md text-sm transition ${activeTab === "customer support" ? "bg-green-100 text-green-800 font-semibold" : "text-gray-600 hover:text-black"
                  }`}
              >
                Customer Support
              </button>
            </div>
          </div>
        </DropdownItem>

        {activeTab === "stock" &&
          <DropdownItem textValue="First Filter Section" isReadOnly className='p-0'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-2 bg-gray-200 w-full px-4 py-2'>
                <button onClick={() => setFilter("all")}
                  className={filter === "all" ? "font-bold text-green-800" : "text-gray-600"}>All</button>
                <button onClick={() => setFilter("unread")}
                  className={`${filter === "unread" ? "font-bold text-green-800" : "text-gray-600"}`}>
                  <span>Unread ({unreadCount})</span>
                </button>
                <button onClick={() => setFilter("done")}
                  className={`${filter === "done" ? "font-bold text-green-800" : "text-gray-600"}`}>
                  <span>Done ({notifiedCount})</span>
                </button>
              </div>
            </div>
          </DropdownItem>
        }

        {activeTab === "stock" &&
          <DropdownItem textValue="Stock Section" className='hover:!bg-white p-0' isReadOnly>
            <div className="overflow-y-auto w-full max-h-[700px]">
              {displayedNotifications?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notifications to show.</div>
              ) : (
                displayedNotifications?.map((detail, idx) => (
                  <div
                    key={`${idx}`}
                    className={`px-4 py-2 border-b last:border-none hover:bg-gray-50 cursor-pointer ${detail?.isRead ? "" : "bg-gray-100"}`}
                    onClick={() => handleNotificationClick(detail)}>
                    <div className="flex justify-between items-center w-full">
                      {detail.type === "Notified" ? (
                        // 🔔 NOTIFIED TYPE UI
                        <div className="w-full space-y-1">
                          <div className={`${detail?.isRead ? "" : "font-bold"} text-sm text-gray-700 flex flex-wrap items-center gap-x-1`}>
                            <span>New request for</span>
                            <span className={`${detail?.isRead ? "font-medium" : "font-bold"} text-neutral-700 whitespace-nowrap`}>
                              {productId[detail.productId] || (
                                <span className="text-gray-400">Loading product...</span>
                              )}
                            </span>
                            <span>{`,`}</span>
                            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-1">
                              <span>Size:</span>
                              <span className={`${detail?.isRead ? "font-medium" : "font-bold"} whitespace-nowrap`}>{detail.size}</span>
                              <span>|</span>
                              <span className="flex items-center whitespace-nowrap">
                                Color:
                                <span
                                  className="w-4 h-4 ml-2 rounded-full border border-gray-300"
                                  style={{ backgroundColor: detail.colorCode }}
                                ></span>
                              </span>
                            </div>
                          </div>
                          <div className='flex items-center gap-32'>
                            <p className="text-sm text-gray-500">{getTimeAgo(detail.dateTime)}</p>
                            <p className="flex items-center gap-1">
                              {detail.notified ? (
                                <span className="text-green-600 text-xs font-medium flex items-center">
                                  ✅ Updated
                                </span>
                              ) : (
                                <span className="text-red-500 text-xs font-medium flex items-center">
                                  ❌ Updated
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // 📦 ORDERED TYPE UI
                        <div className="w-full space-y-1">
                          <div className="text-sm text-gray-700">
                            {detail.orderStatus === "Pending" ? (
                              <>
                                <span className={`${detail?.isRead ? "font-medium" : "font-bold"}`}>New order placed: </span>
                                <span className={`${detail?.isRead ? "font-medium" : "font-bold"} text-black whitespace-nowrap`}>{detail.orderNumber}</span>
                              </>
                            ) : detail.orderStatus === "Return Requested" ? (
                              <>
                                <span className={`${detail?.isRead ? "font-medium" : "font-bold"}`}>Return requested for order: </span>
                                <span className={`${detail?.isRead ? "font-medium" : "font-bold"} text-black whitespace-nowrap`}>{detail.orderNumber}</span>
                              </>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-500">{getTimeAgo(detail.dateTime)}</p>
                        </div>
                      )}

                      {/* Blue dot if unread */}
                      <div>
                        {detail?.isRead ? null : <span className='text-blue-600'><GoDotFill size={20} /></span>}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {(() => {
                const fullFilteredList =
                  filter === "unread"
                    ? notificationList?.filter(n => !n.isRead)
                    : filter === "done"
                      ? notificationList?.filter(n => n.notified)
                      : notificationList;

                return fullFilteredList?.length > 5 && !showAll && (
                  <div className="text-center my-4">
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Show all notifications
                    </button>
                  </div>
                );
              })()}

            </div>
          </DropdownItem>
        }

        {activeTab === "customer support" &&
          <DropdownItem textValue="Second Filter Section" isReadOnly className='p-0'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-2 bg-gray-200 w-full px-4 py-2'>
                <button onClick={() => setFilter2("all")}
                  className={filter2 === "all" ? "font-bold text-green-800" : "text-gray-600"}>All</button>
                <button onClick={() => setFilter2("unread")}
                  className={`${filter2 === "unread" ? "font-bold text-green-800" : "text-gray-600"}`}>
                  <span>Unread ({unreadCustomerSupportCount})</span>
                </button>
              </div>
            </div>
          </DropdownItem>
        }

        {activeTab === "customer support" &&
          <DropdownItem textValue="Support Inbox" className='hover:!bg-white p-0' isReadOnly>
            <div className="overflow-y-auto w-full max-h-[700px]">
              {displayedInboxes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notifications to show.</div>
              ) : (
                displayedInboxes.map((detail, idx) => (
                  <div
                    key={detail._id}
                    className={`px-4 py-2 border-b last:border-none hover:bg-gray-50 cursor-pointer ${detail?.isRead ? "" : "bg-gray-100"}`}
                    onClick={() => handleNotificationClick2(detail)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="w-full space-y-1">
                        <div className={`${detail?.isRead ? "" : "font-bold"} text-sm text-gray-700`}>
                          New support message from <span className="font-bold">{detail.name}</span> regarding <span className="italic">{detail.topic}</span>
                        </div>
                        <p className="text-sm text-gray-500">{getTimeAgo(detail.dateTime)}</p>
                      </div>

                      {!detail.isRead && (
                        <span className="text-blue-600">
                          <GoDotFill size={20} />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {(() => {
                const fullFilteredList =
                  filter2 === "unread"
                    ? existingCustomerSupport?.filter(n => !n.isRead)
                    : existingCustomerSupport;

                return fullFilteredList?.length > 5 && !showAll2 && (
                  <div className="text-center my-4">
                    <button
                      onClick={() => setShowAll2(true)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Show all notifications
                    </button>
                  </div>
                );
              })()}

            </div>
          </DropdownItem>
        }


      </DropdownMenu>

    </Dropdown>
  );
};

export default Notifications;