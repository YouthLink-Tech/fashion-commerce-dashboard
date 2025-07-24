"use client";
import useCustomerSupport from '@/app/hooks/useCustomerSupport';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loading from '../shared/Loading/Loading';
import { GoDotFill } from 'react-icons/go';
import { formatHeadingMessageDate, formatMessageDate } from '../navbar/GetTimeAgo';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import SupportFilterDropdown from './SupportFilter';
import AssignUser from './AssignUser';
import { useSearchParams } from 'next/navigation';
import { TbMessageFilled } from "react-icons/tb";
import { Checkbox, DateRangePicker } from '@nextui-org/react';
import SendMessageBox from './SendMessageBox';
import toast from 'react-hot-toast';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { IoMdClose } from 'react-icons/io';
import { today, getLocalTimeZone } from "@internationalized/date";
import { FaCalendarAlt } from "react-icons/fa";
import { extractVisibleMessage, formatContentType, formatFileSize, getInitialPreviewTextFromCustomer, getPreviewText, isImage } from '@/app/utils/support/supportUtils';
import Image from 'next/image';

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
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [selectedFilter, setSelectedFilter] = useState(new Set(['all']));

  useEffect(() => {
    setSelectedMessage(null);
  }, [searchQuery, filter, selectedDateRange]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const parseDate = (dateString) => {
    return new Date(dateString); // Automatically parses ISO format
  };

  const { startDate, adjustedEndDate } = useMemo(() => {
    const start = selectedDateRange?.start
      ? new Date(
        selectedDateRange.start.year,
        selectedDateRange.start.month - 1,
        selectedDateRange.start.day
      )
      : null;

    const end = selectedDateRange?.end
      ? new Date(
        selectedDateRange.end.year,
        selectedDateRange.end.month - 1,
        selectedDateRange.end.day
      )
      : null;

    const adjustedEnd = end
      ? new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1)
      : null;

    return { startDate: start, adjustedEndDate: adjustedEnd };
  }, [selectedDateRange]);

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  const handleReset = () => {
    setSelectedDateRange(null);
  };

  const currentDate = today(getLocalTimeZone());

  const displayedInboxes = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!existingCustomerSupport) return [];

    // Start with all
    let baseList = existingCustomerSupport;

    // Apply unread filter
    if (filter === "unread") {
      baseList = baseList.filter(n => !n?.isRead);
    }

    // Apply date range if selected
    if (startDate && adjustedEndDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(adjustedEndDate);
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);

      baseList = baseList.filter(item => {
        const messageDate = parseDate(item.dateTime);
        return messageDate >= startDateObj && messageDate <= endDateObj;
      });
    }

    // Apply search query
    if (!normalizedQuery) return baseList;

    return baseList.filter((item) => {
      const {
        supportId = '',
        name = '',
        email = '',
        phone = '',
        topic = '',
      } = item;

      const fieldsToSearch = [
        supportId,
        name,
        email,
        topic,
        phone?.toString(),
      ];

      return fieldsToSearch.some(field =>
        field?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [existingCustomerSupport, filter, searchQuery, adjustedEndDate, startDate]);

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
            <h1 className='py-4 px-6 text-base 2xl:text-xl font-semibold text-neutral-700'>Support Inbox</h1>

            <div className='flex justify-center items-center gap-4'>
              <SupportFilterDropdown selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                onFilterChange={handleFilterChange} />
              <div>

                <div className='flex items-center justify-start gap-2'>
                  <DateRangePicker
                    aria-label="Select date range"
                    selectorIcon={<FaCalendarAlt size={16} />}
                    selectorButtonPlacement="start" // Place icon at the start
                    selectorButtonProps={{
                      size: 'sm',
                      variant: 'light',
                      radius: 'full',
                      isIconOnly: true, // Ensure button is icon-only
                    }}
                    visibleMonths={2}
                    maxValue={currentDate}
                    onChange={(range) => setSelectedDateRange(range)} // Ensure range is an array
                    value={selectedDateRange} // Ensure this matches the expected format
                    classNames={{
                      inputWrapper: [
                        '!bg-transparent', // Adjust background if needed
                        'min-w-[40px]', // Ensure enough space for icon
                      ],
                      input: ['hidden'], // Hide input text completely
                      segment: ['hidden'], // Hide date segments (mm/dd/yyyy)
                      separator: ['hidden'], // Hide separator (-)
                      selectorButton: [
                        'w-10 h-10', // Fixed size for icon button
                      ],
                      selectorIcon: ['text-gray-500', 'w-5 h-5'], // Ensure icon is styled and visible
                    }}
                  />

                  {(selectedDateRange?.start && selectedDateRange?.end) && (
                    <button className="hover:text-red-500 font-bold text-white rounded-lg bg-red-600 hover:bg-white p-1 mr-1" onClick={handleReset}>
                      <IoMdClose className="text-lg" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

          {
            displayedInboxes?.length > 0 ? (
              displayedInboxes.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleOpenMessage(item)}
                  className={`flex justify-between items-center cursor-pointer px-3 py-3 2xl:px-6 2xl:py-4 hover:bg-gray-100 border-b transition-all ${selectedMessage?._id === item._id ? 'bg-blue-100 border-blue-300' : ''
                    }`}
                >
                  <div className='flex gap-0 2xl:gap-4 items-center'>
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
                      <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-gray-400`}>{item.topic} ({item.supportId})</p>
                      <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-neutral-600 truncate`}>{item.email}</p>
                      {/* {item.replies &&
                        <p className={`${item?.isRead ? "" : "font-bold"} md:text-xs 2xl:text-sm text-neutral-600 truncate`}>
                          {getLastReplyPreview(item.replies)}
                        </p>
                      } */}
                    </div>
                  </div>
                  <div className="text-[10px] 2xl:text-xs flex flex-col items-end gap-2">
                    <span className='text-neutral-700'>
                      {formatHeadingMessageDate(
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
                    <h2 className="text-2xl font-bold text-gray-800">{selectedMessage?.topic}</h2>
                    <h3 className='text-neutral-600 text-sm font-semibold'>{selectedMessage.supportId}</h3>
                    <div className="text-sm text-gray-500">
                      From: {selectedMessage?.name ? `${selectedMessage.name} (${selectedMessage.email})` : selectedMessage?.email}
                    </div>
                    {selectedMessage.phone &&
                      <div className="text-sm text-gray-500">Phone: {selectedMessage?.phone}</div>
                    }
                    <hr />
                    {(() => {
                      const message = selectedMessage?.message?.html || "";
                      const attachments = selectedMessage?.message?.attachments || [];
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

                          {attachments.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-600">Attachments:</h4>
                              <ul className="mt-1 space-y-2">
                                {attachments.map((attachment, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    {isImage(attachment.contentType) ? (
                                      <div className="flex flex-col">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                          title={`Type: ${formatContentType(attachment.contentType)}`}
                                        >
                                          {attachment.name} ({formatFileSize(attachment.size)})
                                        </a>
                                        <Image
                                          src={attachment.url}
                                          alt={attachment.name}
                                          height={2000}
                                          width={2000}
                                          className="mt-1 max-w-xs rounded border border-gray-200"
                                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                        title={`Type: ${formatContentType(attachment.contentType)}`}
                                      >
                                        {attachment.name} ({formatFileSize(attachment.size)})
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

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
                      const attachments = reply?.attachments || [];

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

                          {attachments.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-600">Attachments:</h4>
                              <ul className="mt-1 space-y-2">
                                {attachments.map((attachment, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    {isImage(attachment.contentType) ? (
                                      <div className="flex flex-col">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                          title={`Type: ${formatContentType(attachment.contentType)}`}
                                        >
                                          {attachment.name} ({formatFileSize(attachment.size)})
                                        </a>
                                        <Image
                                          src={attachment.url}
                                          alt={attachment.name}
                                          height={2000}
                                          width={2000}
                                          className="mt-1 max-w-xs rounded border border-gray-200"
                                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                        title={`Type: ${formatContentType(attachment.contentType)}`}
                                      >
                                        {attachment.name} ({formatFileSize(attachment.size)})
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

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