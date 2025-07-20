"use client";
import useCustomerSupport from '@/app/hooks/useCustomerSupport';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const messageEndRef = useRef(null);
  const [existingCustomerSupport, isCustomerSupportPending, refetch] = useCustomerSupport();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [isInitialMessageExpanded, setIsInitialMessageExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedMessage(null);
  }, [searchQuery, filter]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const displayedInboxes = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!existingCustomerSupport) return [];

    // Filter unread if needed
    let baseList = filter === "unread"
      ? existingCustomerSupport.filter(n => !n?.isRead)
      : existingCustomerSupport;

    if (!normalizedQuery) return baseList;

    return baseList.filter((item) => {
      const {
        supportId = '',
        name = '',
        email = '',
        phone = '',
        topic = '',
        dateTime = ''
      } = item;

      const fieldsToSearch = [
        supportId,
        name,
        email,
        topic,
        phone?.toString(),
        new Date(dateTime).toLocaleString("en-US") // normalized date string
      ];

      return fieldsToSearch.some(field =>
        field?.toLowerCase().includes(normalizedQuery)
      );
    });

  }, [existingCustomerSupport, filter, searchQuery]);

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

  const toggleReplyExpand = (index) => {
    setExpandedReplies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const extractVisibleMessage = (html) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove Gmail's quoted history
    const quote = doc.querySelector(".gmail_quote");
    if (quote) quote.remove();

    return doc.body.innerHTML;
  };

  const getInitialPreviewTextFromCustomer = (text = "", wordLimit = 20) => {
    const words = text.trim().split(/\s+/);
    const isTruncated = words.length > wordLimit;
    const preview = words.slice(0, wordLimit).join(" ") + (isTruncated ? "..." : "");
    return { preview, isTruncated };
  };

  const getLastReplyPreview = (replies = [], charLimit = 40) => {
    if (!replies?.length) return null;

    const lastReply = replies[replies.length - 1];
    const from = lastReply?.from === "support" ? "You" : "Customer";

    const cleanHtml = extractVisibleMessage(lastReply?.html || "");

    const div = document.createElement("div");
    div.innerHTML = cleanHtml;
    const text = (div.textContent || div.innerText || "").trim();

    const isTruncated = text.length > charLimit;
    const preview = text.slice(0, charLimit) + (isTruncated ? "..." : "");

    return `${from}: ${preview}`;
  };

  const getPreviewText = (html = "", wordLimit = 20) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    const words = text.trim().split(/\s+/);
    const isTruncated = words.length > wordLimit;
    const preview = words.slice(0, wordLimit).join(" ") + (isTruncated ? "..." : "");
    return { preview, isTruncated };
  };

  useEffect(() => {
    if (selectedMessage || isOpen) {
      setTimeout(scrollToBottom, 100); // Delay ensures DOM is ready
    }
  }, [selectedMessage, isOpen]);

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
                      <p className={`${item?.isRead ? "font-medium" : "font-bold"} text-neutral-900 md:text-sm 2xl:text-base`}>{item.name}</p>
                      <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-gray-400`}>{item.topic}</p>
                      <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-neutral-600 truncate`}>{item.email}</p>
                      {item.replies &&
                        <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-neutral-600 truncate`}>
                          {getLastReplyPreview(item.replies)}
                        </p>
                      }
                    </div>
                  </div>
                  <div className="text-xs flex flex-col items-end gap-2">
                    <span className="text-neutral-600 font-semibold">{item.supportId}</span>
                    <span className='text-neutral-700'>
                      {formatMessageDate(
                        item?.replies?.length > 0
                          ? item.replies[item.replies.length - 1]?.dateTime
                          : item.dateTime
                      )}
                    </span>
                  </div>
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

            {/* Search Customer Message */}
            <div className='w-2/3 mx-auto'>
              <li className="flex items-center relative group">
                <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  placeholder="Search By Support Details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
                />
              </li>
            </div>

          </div>

          {
            selectedMessage ? (
              <div className="relative flex flex-col h-[calc(100vh-122px)] min-h-0"> {/* whole page or panel height minus navbar */}

                {/* Scrollable message view */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedMessage?.topic} [{selectedMessage.supportId}]</h2>
                    <div className="text-sm text-gray-500">
                      From: {selectedMessage?.name ? `${selectedMessage.name} (${selectedMessage.email})` : selectedMessage?.email}
                    </div>
                    {selectedMessage.phone &&
                      <div className="text-sm text-gray-500">Phone: {selectedMessage?.phone}</div>
                    }
                    <hr />
                    {(() => {
                      const message = selectedMessage?.message || "";
                      const htmlContent = extractVisibleMessage(message); // Clean HTML
                      const { preview, isTruncated } = getInitialPreviewTextFromCustomer(htmlContent, 20);

                      return (
                        <div className="bg-blue-50 border-blue-200 border p-4 rounded">
                          <div className="text-sm text-gray-500 mb-2">
                            From:{" "}
                            <span className="font-medium text-gray-700">
                              {selectedMessage?.email}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-gray-700">
                            {isInitialMessageExpanded ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: htmlContent
                                }}
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: preview
                                }}
                              />
                            )}
                          </p>

                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {formatMessageDate(selectedMessage?.dateTime)}
                            </p>

                            {isTruncated && (
                              <button
                                onClick={() => setIsInitialMessageExpanded(prev => !prev)}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {isInitialMessageExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Replies */}
                    {selectedMessages?.replies?.map((reply, index) => {
                      const isExpanded = expandedReplies[index];
                      const replyFrom =
                        reply?.from === "support"
                          ? "support@poshax.shop"
                          : selectedMessage?.email;

                      const htmlContent =
                        reply?.from === "customer"
                          ? extractVisibleMessage(reply?.html)
                          : reply?.html;

                      const { preview, isTruncated } = getPreviewText(htmlContent, 20);

                      return (
                        <div key={index} className={`${reply?.from === "support" ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"} border p-4 rounded relative`}>
                          <div className="text-sm text-gray-500 mb-2">
                            From: <span className="font-medium text-gray-700">{replyFrom}</span>
                          </div>

                          <div className="text-gray-800">
                            {isExpanded ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: htmlContent
                                }}
                              />
                            ) : (
                              <p>{preview}</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">{formatMessageDate(reply?.dateTime)}</p>

                            {/* Only show toggle if content is longer than 40 words */}
                            {isTruncated && (
                              <button
                                className="text-sm text-blue-600 hover:underline"
                                onClick={() => toggleReplyExpand(index)}
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                </div>

                {/* Sticky send message box */}
                <SendMessageBox onSend={handleSend} isOpen={isOpen} setIsOpen={setIsOpen} />

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