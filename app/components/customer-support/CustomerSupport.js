"use client";
import useCustomerSupport from '@/app/hooks/useCustomerSupport';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../shared/Loading/Loading';
import { GoDotFill } from 'react-icons/go';
import { formatMessageDate } from '../navbar/GetTimeAgo';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import SupportFilterDropdown from './SupportFilter';
import AssignUser from './AssignUser';
import { useSearchParams } from 'next/navigation';
import { TbMessageFilled } from "react-icons/tb";
import { Checkbox } from '@nextui-org/react';

const CustomerSupportComponent = () => {

  const searchParams = useSearchParams();
  const selectedMessageId = searchParams.get("selectedMessageId");
  const [existingCustomerSupport, isCustomerSupportPending, refetch] = useCustomerSupport();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [selectedUsers, setSelectedUsers] = useState([]);

  const displayedInboxes = useMemo(() => {
    let baseList;

    if (filter === "unread") {
      baseList = existingCustomerSupport?.filter(n => !n.isRead);
    } else {
      baseList = existingCustomerSupport;
    }

    return baseList;
  }, [existingCustomerSupport, filter]);

  const handleOpenMessage = useCallback(async (item) => {
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

    try {
      const res = await axiosSecure.get(`/assigned-users/${item._id}`);
      if (res.data.success) {
        setSelectedUsers(res.data.assignedUsers);
      }
    } catch (err) {
      console.error("Failed to fetch assigned users", err);
    }
  }, [axiosSecure, refetch]);

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

  useEffect(() => {
    if (!selectedMessageId || !existingCustomerSupport) return;

    const foundMessage = existingCustomerSupport.find(m => m._id === selectedMessageId);
    if (foundMessage) {
      handleOpenMessage(foundMessage);
    }
  }, [selectedMessageId, existingCustomerSupport, handleOpenMessage]);

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
            displayedInboxes?.length > 0 ? (
              displayedInboxes.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleOpenMessage(item)}
                  className={`flex justify-between items-center cursor-pointer px-6 py-4 hover:bg-gray-100 border-b transition-all ${selectedMessage?._id === item._id ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                >
                  <div className='flex gap-4 items-center'>
                    <div className='flex flex-col gap-2 items-center justify-center'>
                      <Checkbox
                        isSelected={selectedIds.includes(item._id)}
                        size='sm'
                        onValueChange={(isSelected) => {
                          if (isSelected) {
                            setSelectedIds([...selectedIds, item._id]);
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== item._id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {!item?.isRead && (
                        <span className="text-blue-600 pr-2">
                          <GoDotFill size={18} />
                        </span>
                      )}
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
            {selectedIds?.length > 0 && (
              <div className="p-4 flex items-center gap-4 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => handleMarkAsUnread(selectedIds)}
                  className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 rounded-lg px-3 py-1.5 hover:text-blue-700"
                >
                  <TbMessageFilled size={16} /> Mark as Unread
                </button>
              </div>
            )}
            {selectedIds?.length === 0 && selectedMessage?._id &&
              <div className="p-4 flex items-center gap-4 bg-gray-50 border-b border-gray-200">
                <AssignUser
                  messageId={selectedMessage?._id}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers} />
              </div>
            }
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
