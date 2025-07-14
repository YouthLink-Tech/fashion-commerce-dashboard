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
import SendMessageBox from './SendMessageBox';
import toast from 'react-hot-toast';
import { RxCheck, RxCross2 } from 'react-icons/rx';

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

  const handleSend = async ({ supportReplyHtml }) => {

    const replyData = {
      messageId: selectedMessage?._id,
      supportReplyHtml,
    }

    // Call backend API with supportReplyHtml
    const response = await axiosSecure.post('/send-reply', replyData);
    if (response.data.success === true) {
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
        >
          <div className="pl-6">
            <RxCheck className="h-6 w-6 bg-green-500 text-white rounded-full" />
          </div>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-base font-bold text-gray-900">
                  Message sent!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your support mail sent successfully!
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-text-700 focus:outline-none text-2xl"
            >
              <RxCross2 />
            </button>
          </div>
        </div>
      ), {
        position: "bottom-right",
        duration: 5000
      });
      refetch();
    }

  };

  const selectedMessages = useMemo(() => {
    return displayedInboxes?.find(m => m._id === selectedMessage?._id);
  }, [displayedInboxes, selectedMessage?._id]);

  const extractVisibleMessage = (html) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove Gmail's quoted history
    const quote = doc.querySelector(".gmail_quote");
    if (quote) quote.remove();

    return doc.body.innerHTML;
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
              <div className="py-4 px-2 flex items-center gap-4">
                <button
                  onClick={() => handleMarkAsUnread(selectedIds)}
                  className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 rounded-lg px-3 py-1.5 hover:text-blue-700"
                >
                  <TbMessageFilled size={16} /> Mark as Unread
                </button>
              </div>
            )}
            {selectedIds?.length === 0 && selectedMessage?._id &&
              <div className="py-4 px-2 flex items-center gap-4">
                <AssignUser
                  messageId={selectedMessage?._id}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers} />
              </div>
            }
          </div>

          {
            selectedMessage ? (
              <div className="relative h-[calc(100vh-178px)]"> {/* whole page or panel height minus navbar */}

                {/* Scrollable message view */}
                <div className="overflow-y-auto h-full">
                  <div className="space-y-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedMessage?.topic}</h2>
                    <div className="text-sm text-gray-500">From: {selectedMessage?.name} ({selectedMessage?.email})</div>
                    <div className="text-sm text-gray-500">Phone: {selectedMessage?.phone}</div>
                    <hr />
                    <div className="bg-gray-100 p-4 rounded">
                      <div className="text-sm text-gray-500 mb-2">
                        From:{" "}
                        <span className="font-medium text-gray-700">
                          {selectedMessage?.email}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-700">{selectedMessage?.message}</p>
                      <p className="text-xs text-right text-gray-500 mt-1">{formatMessageDate(selectedMessage?.dateTime)}</p>
                    </div>

                    {/* Replies */}
                    {selectedMessages?.replies?.map((reply, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 p-4 rounded">
                        <div className="text-sm text-gray-500 mb-2">
                          From:{" "}
                          <span className="font-medium text-gray-700">
                            {reply?.from === "support"
                              ? "support@poshax.shop"
                              : selectedMessage?.email}
                          </span>
                        </div>
                        <div
                          className="text-gray-800"
                          dangerouslySetInnerHTML={{
                            __html:
                              reply?.from === "customer"
                                ? extractVisibleMessage(reply?.html)
                                : reply?.html,
                          }}
                        />
                        <p className="text-xs text-right text-gray-500 mt-1">{formatMessageDate(reply?.dateTime)}</p>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Sticky send message box */}
                <SendMessageBox onSend={handleSend} />

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
