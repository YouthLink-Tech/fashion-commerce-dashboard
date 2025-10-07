"use client";
import useOrders from '@/app/hooks/useOrders';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, CheckboxGroup, DateRangePicker, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { IoMdClose } from 'react-icons/io';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { getLocalTimeZone, today } from '@internationalized/date';
import { TbColumnInsertRight } from 'react-icons/tb';
import SmallHeightLoading from '../../shared/Loading/SmallHeightLoading';
import CustomPagination from '../../shared/pagination/CustomPagination';
import PaginationSelect from '../../shared/pagination/PaginationSelect';

const initialColumns = ["Date & Time", 'Order ID', 'Customer Name', 'Transaction ID', 'Order Amount', 'Refund Status', 'Refunded Amount', 'Refunded Items', 'Payment Status'];

const FinanceTable = () => {

  const [orderList, isOrderPending, refetch] = useOrders();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState(initialColumns);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem('selectedColumnsFinance'));
    const savedColumnsFinancesPage = JSON.parse(localStorage.getItem('selectedColumnsFinancesPage'));
    if (savedColumns) {
      setSelectedColumns(savedColumns);
    } else {
      // Set to default if no saved columns exist
      setSelectedColumns(initialColumns);
    }

    if (savedColumnsFinancesPage) {
      setColumnOrder(savedColumnsFinancesPage);
    } else {
      // Set to default column order if no saved order exists
      setColumnOrder(initialColumns);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      refetch();  // RefetchOrders when search query changes
    }
  }, [searchQuery, refetch]);

  const handleColumnChange = (selected) => {
    setSelectedColumns(selected);
  };

  const handleSelectAll = () => {
    setSelectedColumns(initialColumns);
    setColumnOrder(initialColumns);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSave = () => {
    localStorage.setItem('selectedColumnsFinance', JSON.stringify(selectedColumns));
    localStorage.setItem('selectedColumnsFinancesPage', JSON.stringify(columnOrder));
    setColumnModalOpen(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columnOrder);
    const [draggedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, draggedColumn);

    setColumnOrder(reorderedColumns); // Update the column order both in modal and table
  };

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setPage(0); // Reset to first page when changing items per page
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown)); // Toggle the clicked dropdown
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Convert dateTime string to Date object
  const parseDate = (dateString) => {
    const [date, time] = dateString.split(' | ');
    const [day, month, year] = date.split('-').map(num => parseInt(num, 10));
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    return new Date(year + 2000, month - 1, day, hours, minutes);
  };

  // Extract start and end dates from selectedDateRange
  const startDate = selectedDateRange?.start ? new Date(selectedDateRange.start.year, selectedDateRange.start.month - 1, selectedDateRange.start.day) : null;
  const endDate = selectedDateRange?.end ? new Date(selectedDateRange.end.year, selectedDateRange.end.month - 1, selectedDateRange.end.day) : null; // Adjust end date to include the entire end day
  const adjustedEndDate = endDate ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1) : null; // Add 1 day and subtract 1 ms

  const currentDate = today(getLocalTimeZone());

  const handleReset = () => {
    setSelectedDateRange(null); // Reset the selected date range
  };

  // Filter orders based on search query and date range
  const searchedOrders = orderList?.filter(order => {
    const query = searchQuery.toLowerCase();

    // Date range filtering
    const orderDate = parseDate(order.dateTime);
    const isDateInRange = startDate && adjustedEndDate
      ? (orderDate >= startDate && orderDate <= adjustedEndDate)
      : true;

    // Payment status filtering
    const isStatusMatch = selectedPaymentStatus === 'All' || order?.paymentInfo?.paymentStatus === selectedPaymentStatus;

    // --- Refund logic for search ---
    let refundAmount = 0;
    let refundSku = 0;
    if (order.orderStatus === "Refunded" && order.returnInfo) {
      for (const product of order.returnInfo.products || []) {
        if (product.status === "Accepted") {
          refundAmount += (product.finalUnitPrice || 0) * (product.sku || 0);
          refundSku += (product.sku || 0);
        }
      }
    }

    // Check if order details match the search query
    const orderMatch = (
      (order.orderNumber || '').toLowerCase().includes(query) ||
      (order.customerInfo.customerName || '').toLowerCase().includes(query) || // Added customerName search
      (order.paymentInfo.transactionId || '').toLowerCase().includes(query) ||
      (order.paymentInfo.paymentStatus || '').toLowerCase().includes(query) ||
      refundAmount.toString().includes(query) || // ✅ Search refund amount
      refundSku.toString().includes(query)       // ✅ Search refund SKU count
    );

    // Check if query matches date in specific format
    const dateMatch = (order.dateTime || '').toLowerCase().includes(query);

    return isDateInRange && isStatusMatch && (orderMatch || dateMatch);
  });

  const paginatedOrders = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchedOrders?.slice(startIndex, endIndex);
  }, [searchedOrders, page, itemsPerPage]);

  const totalPages = Math.ceil(searchedOrders?.length / itemsPerPage);

  useEffect(() => {
    if (paginatedOrders?.length === 0) {
      setPage(0); // Reset to the first page if no data
    }
  }, [paginatedOrders]);

  if (isOrderPending) {
    return <SmallHeightLoading />
  }

  return (
    <div className='relative'>

      <div className='flex flex-col lg:flex-row items-center justify-evenly gap-6'>

        <div className='w-full'>
          <li className="flex items-center relative group flex-1">
            <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="search"
              placeholder="Search By Order Details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
            />
          </li>
        </div>

        <div className="flex items-center gap-6 flex-wrap w-full">
          <select
            id="paymentStatusFilter"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="border border-gray-300 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9f511681] focus:border-transparent bg-white transition-all duration-200 ease-in-out w-full lg:w-1/2"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div ref={dropdownRef} className="relative inline-block text-left z-50">
          <button onClick={() => toggleDropdown('other')} className="relative z-[1] flex items-center gap-x-1.5 rounded-lg bg-[#ffddc2] px-3 py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[10px] md:text-[14px] text-neutral-700">
            CUSTOMIZE
            <svg
              className={`h-5 w-5 transform transition-transform duration-300 ${openDropdown === "other" ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === 'other' && (
            <div className="absolute right-0 z-10 mt-2 w-64 md:w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

              <div className='p-1'>

                <div className='flex items-center gap-2 mb-2'>

                  <DateRangePicker
                    label="Order Duration"
                    visibleMonths={1}
                    onChange={(range) => setSelectedDateRange(range)} // Ensure range is an array
                    value={selectedDateRange} // Ensure this matches the expected format
                    maxValue={currentDate}
                  />

                  {selectedDateRange && selectedDateRange.start && selectedDateRange.end && (
                    <button className="hover:text-red-500 font-bold text-white rounded-lg bg-red-600 hover:bg-white p-1" onClick={handleReset}>
                      <IoMdClose size={20} />
                    </button>
                  )}
                </div>

                {/* Choose Columns Button */}
                <button className="relative z-[1] flex items-center justify-center gap-x-3 rounded-lg bg-[#ffddc2] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[14px] text-neutral-700 w-full" onClick={() => { setColumnModalOpen(true); }}>
                  Choose Columns <TbColumnInsertRight size={20} />
                </button>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Column Selection Modal */}
      <Modal isOpen={isColumnModalOpen} onClose={() => setColumnModalOpen(false)}>
        <ModalContent>
          <ModalHeader className='bg-gray-200'>Choose Columns</ModalHeader>
          <ModalBody className="modal-body-scroll">
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <CheckboxGroup value={selectedColumns} onChange={handleColumnChange}>
                      {columnOrder.map((column, index) => (
                        <Draggable key={column} draggableId={column} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between p-2 border-b"
                            >
                              <Checkbox
                                value={column}
                                isChecked={selectedColumns.includes(column)}
                                onChange={() => {
                                  // Toggle column selection
                                  if (selectedColumns.includes(column)) {
                                    setSelectedColumns(selectedColumns.filter(col => col !== column));
                                  } else {
                                    setSelectedColumns([...selectedColumns, column]);
                                  }
                                }}
                              >
                                {column}
                              </Checkbox>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CheckboxGroup>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ModalBody>
          <ModalFooter className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Button onPress={handleDeselectAll} size="sm" color="default" variant="flat">
                Deselect All
              </Button>
              <Button onPress={handleSelectAll} size="sm" color="primary" variant="flat">
                Select All
              </Button>
            </div>
            <Button variant="solid" color="primary" size='sm' onPress={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TABLE */}
      <div className="custom-scrollbar custom-max-discount overflow-x-auto mt-6 drop-shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-[1] rounded-md">
            <tr>
              {columnOrder.map((column) => selectedColumns.includes(column) && (
                <th key={column} className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b">{column}</th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders?.length === 0 ?
              <tr>
                <td colSpan={selectedColumns.length} className="text-center p-4 text-gray-500 md:pt-40 pt-32 lg:pt-48 xl:pt-56 2xl:py-60">
                  No orders found matching your criteria. Please adjust your filters or check back later.
                </td>
              </tr>
              :
              (paginatedOrders?.map((order, index) => {

                return (
                  <React.Fragment key={index}>
                    <tr key={order?._id || index} className="hover:bg-gray-50 transition-colors">
                      {columnOrder.map(
                        (column) =>
                          selectedColumns.includes(column) && (
                            <React.Fragment key={`${order?._id || index}-${column}`}>
                              {column === 'Date & Time' && (
                                <td key="dateTime" className="text-xs p-3 text-gray-700">
                                  {order?.dateTime}
                                </td>
                              )}
                              {column === 'Order ID' && (
                                <td key="orderNumber" className="text-xs p-3 text-gray-700">
                                  {order?.orderNumber}
                                </td>
                              )}
                              {column === 'Customer Name' && (
                                <td key="customerName" className="text-xs p-3 text-gray-700">
                                  {order?.customerInfo?.customerName}
                                </td>
                              )}
                              {column === 'Transaction ID' && (
                                <td key="transactionId" className="text-xs p-3 text-gray-700">
                                  {order?.paymentInfo?.transactionId ? order?.paymentInfo?.transactionId : '--'}
                                </td>
                              )}
                              {column === 'Order Amount' && (
                                <td key="orderAmount" className="text-xs p-3 text-gray-700">
                                  {order?.total}
                                </td>
                              )}
                              {column === 'Refund Status' && (
                                <td key="refundStatus" className="text-xs p-3 text-gray-700">
                                  {order?.orderStatus === "Refunded"
                                    ? "Refunded"
                                    : "N/A"}
                                </td>
                              )}
                              {column === 'Refunded Amount' && (
                                <td key="refundedAmount" className="text-xs p-3 text-gray-700">
                                  {order?.orderStatus === "Refunded" && order?.returnInfo?.products
                                    ? order.returnInfo.products
                                      .filter(p => p.status === "Accepted")
                                      .reduce((sum, p) => sum + ((p.finalUnitPrice || 0) * (p.sku || 0)), 0)
                                    : 0
                                  }
                                </td>
                              )}
                              {column === 'Refunded Items' && (
                                <td key="refundedItems" className="text-xs p-3 text-gray-700">
                                  {order?.orderStatus === "Refunded" && order?.returnInfo?.products
                                    ? order.returnInfo.products
                                      .filter(p => p.status === "Accepted")
                                      .reduce((sum, p) => sum + (p.sku || 0), 0) // use quantity instead of sku
                                    : 0
                                  }
                                </td>
                              )}
                              {column === 'Payment Status' && (
                                <td key="paymentStatus" className="text-xs p-3 text-gray-700">
                                  {order?.paymentInfo?.paymentStatus}
                                </td>
                              )}
                            </React.Fragment>
                          )
                      )}
                    </tr>
                  </React.Fragment>
                )
              }))
            }
          </tbody>

        </table>

      </div>

      {/* Pagination Button */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center py-3">
        <CustomPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
        <PaginationSelect
          options={[25, 50, 100]} // ✅ Pass available options
          value={itemsPerPage} // ✅ Selected value
          onChange={handleItemsPerPageChange} // ✅ Handle value change
        />
      </div>

    </div>
  );
};

export default FinanceTable;