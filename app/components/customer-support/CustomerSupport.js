"use client";
import useCustomerSupport from '@/app/hooks/useCustomerSupport';
import React, { useMemo, useState } from 'react';
import Loading from '../shared/Loading/Loading';
import { GoDotFill } from 'react-icons/go';
import { formatMessageDate } from '../navbar/GetTimeAgo';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import SupportFilterDropdown from './SupportFilter';

const CustomerSupportComponent = () => {

  const [existingCustomerSupport, isCustomerSupportPending, refetch] = useCustomerSupport();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'

  const displayedNotifications = useMemo(() => {
    let baseList;

    if (filter === "unread") {
      baseList = existingCustomerSupport?.filter(n => !n.isRead);
    } else {
      baseList = existingCustomerSupport;
    }

    return baseList;
  }, [existingCustomerSupport, filter]);

  const handleOpenMessage = async (item) => {

    setSelectedMessage(item);

    if (!item.isRead) {
      try {
        const result = await axiosSecure.patch(`/mark-as-read-customer-support/${item._id}`);
        if (result.data.success === true) {
          refetch();
        }

      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleMarkAsUnread = async () => {
    if (!selectedIds.length) return;

    try {
      const result = await axiosSecure.patch("/mark-as-unread-customer-support", {
        ids: selectedIds,
      });
      if (result.data.success === true) {
        setSelectedIds([]);
        refetch();
      };
    } catch (err) {
      console.error("Failed to mark as unread", err);
    }
  };

  if (isCustomerSupportPending) return <Loading />;

  return (
    <div className='relative'>

      <div className='grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-60px)]'> {/* Subtract any navbar height */}

        {/* LEFT PANEL - Inbox */}
        <div className='lg:col-span-4 border-r overflow-y-auto custom-scrollbars'>
          <div className='flex justify-between items-center sticky top-0 z-10 bg-gray-50 border-b'>
            <h1 className='py-4 px-6 text-xl font-semibold text-neutral-700'>Support Inbox</h1>
            <SupportFilterDropdown onFilterChange={(value) => setFilter(value)} />
          </div>

          {
            displayedNotifications?.length > 0 ? (
              displayedNotifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleOpenMessage(item)}
                  className={`flex justify-between items-center cursor-pointer px-6 py-4 hover:bg-gray-100 border-b transition-all ${selectedMessage?._id === item._id ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                >
                  <div className='flex gap-4 items-center'>
                    <div className='flex flex-col gap-2 items-center justify-center'>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, item._id]);
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== item._id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {item?.isRead ? null : <span className='text-blue-600'><GoDotFill size={20} /></span>}
                    </div>
                    <div className='flex flex-col'>
                      <p className={`${item?.isRead ? "font-medium" : "font-bold"} text-neutral-900`}>{item.name}</p>
                      <p className={`${item?.isRead ? "" : "font-bold"} text-sm text-gray-400`}>{item.topic}</p>
                      <p className={`${item?.isRead ? "" : "font-bold"} text-sm text-neutral-600 truncate`}>{item.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{formatMessageDate(item.dateTime)}</div>
                </div>

              ))
            ) : (
              <p className="px-6 py-4">No messages yet.</p>
            )
          }

        </div>

        {/* RIGHT PANEL - Message Details */}
        <div className='lg:col-span-8 overflow-y-auto custom-scrollbars'>

          <div className="h-[56px] mt-[5px] px-2 flex items-center gap-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            {selectedIds.length > 0 && (
              <div className="p-4 flex items-center gap-4 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => handleMarkAsUnread(selectedIds)}
                  className="text-blue-600 hover:underline"
                >
                  Mark as Unread
                </button>

                <button
                  onClick={() => {
                    // trigger assign modal or logic
                  }}
                  className="text-green-600 hover:underline"
                >
                  Assign User
                </button>
              </div>
            )}
          </div>

          {
            selectedMessage ? (
              <div className="space-y-4 p-6 min-h-[calc(100vh-125px)]">
                <h2 className="text-2xl font-bold text-gray-800">{selectedMessage.topic}</h2>
                <div className="text-sm text-gray-500">From: {selectedMessage.name} ({selectedMessage.email})</div>
                <div className="text-sm text-gray-500">Phone: {selectedMessage.phone}</div>
                <hr />
                <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
              </div>
            ) : (
              <div className="flex justify-center items-center min-h-[calc(100vh-125px)] text-gray-400">
                <p>Select a message to view details.</p>
              </div>
            )
          }
        </div>

      </div>

    </div>
  );
};

export default CustomerSupportComponent;
