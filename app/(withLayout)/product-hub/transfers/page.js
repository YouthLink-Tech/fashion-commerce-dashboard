"use client";
import React, { useEffect, useMemo, useState } from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import Link from 'next/link';
import useTransferOrders from '@/app/hooks/useTransferOrders';
import Loading from '@/app/components/shared/Loading/Loading';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, CheckboxGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { TbColumnInsertRight } from 'react-icons/tb';
import { FaPlus } from 'react-icons/fa6';
import { useAuth } from '@/app/contexts/auth';
import TabsOrder from '@/app/components/shared/tabs/TabsOrder';
import Progressbar from '@/app/components/product/progress/Progressbar';
import CustomPagination from '@/app/components/shared/pagination/CustomPagination';
import PaginationSelect from '@/app/components/shared/pagination/PaginationSelect';

const transferStatusTabs = [
  'All',
  'Pending',
  'Received',
  'Canceled'
];

const initialColumns = ['Purchase order', 'Origin', 'Destination', 'Status', 'Received', 'Expected Arrival'];

const currentModule = "Product Hub";

const Transfers = () => {

  const router = useRouter();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedTab, setSelectedTab] = useState(transferStatusTabs[0]);
  const [transferOrderList, isTransferOrderPending, refetch] = useTransferOrders();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState(initialColumns);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem('selectedColumnsTransferOrder'));
    const savedOrder = JSON.parse(localStorage.getItem('columnOrderTransferOrder'));

    if (savedColumns) {
      setSelectedColumns(savedColumns);
    } else {
      // Set to default if no saved columns exist
      setSelectedColumns(initialColumns);
    }

    if (savedOrder) {
      setColumnOrder(savedOrder);
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
    localStorage.setItem('selectedColumnsTransferOrder', JSON.stringify(selectedColumns));
    localStorage.setItem('columnOrderTransferOrder', JSON.stringify(columnOrder));
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

  // Function to calculate counts for each tab
  const getOrderCounts = (list) => {
    return {
      'Pending': list?.filter(order => order?.status === 'pending').length || 0,
      'Received': list?.filter(order => order?.status === 'received').length || 0,
      'Canceled': list?.filter(order => order?.status === 'canceled').length || 0,
      'All': list?.filter(order => order?.status).length || 0,
    };
  };

  const getFilteredOrders = () => {
    let filtered = [];

    switch (selectedTab) {
      case 'Pending':
        filtered = transferOrderList?.filter(order => order?.status === 'pending');
        break;
      case 'Received':
        filtered = transferOrderList?.filter(order => order?.status === 'received');
        break;
      case 'Canceled':
        filtered = transferOrderList?.filter(order => order?.status === 'canceled');
        break;
      default:
        filtered = transferOrderList;
    }

    // Sort the filtered orders based on last status change, most recent first
    return filtered;
  };

  // Memoize counts to prevent unnecessary recalculations
  const counts = useMemo(() => {

    const filteredBaseList = searchQuery
      ? transferOrderList?.filter(order => {
        const query = searchQuery.toLowerCase();
        const isNumberQuery = !isNaN(query) && query.trim() !== '';

        // Check if any product detail contains the search query
        const productMatch = order?.transferOrderVariants?.some(product => {
          const productTitle = (product.productTitle || '').toLowerCase();
          const size = (typeof product.size === 'string' ? product.size : '').toLowerCase();
          const colorCode = (product.colorCode || '').toLowerCase();
          const colorName = (product.colorName || '').toLowerCase();
          const quantity = (product.quantity || '').toString(); // Assuming quantity is a number

          return (
            productTitle.includes(query) ||
            size.includes(query) ||
            colorCode.includes(query) ||
            colorName.includes(query) ||
            (isNumberQuery && quantity === query)
          );
        });

        // Check if order details match the search query
        const orderMatch = (
          (order.transferOrderNumber || '').toLowerCase().includes(query) || // Order number
          (order.origin.locationName || '').toLowerCase().includes(query) ||  // Origin location name
          (order.origin.contactPersonName || '').toLowerCase().includes(query) || // Origin contact person
          (order.origin.cityName || '').toLowerCase().includes(query) || // Origin city name
          (order.destination.locationName || '').toLowerCase().includes(query) ||  // Destination location name
          (order.destination.contactPersonName || '').toLowerCase().includes(query) || // Destination contact person
          (order.destination.cityName || '').toLowerCase().includes(query) || // Destination city name
          (order.status || '').toLowerCase().includes(query) || // Order status
          (order.estimatedArrival || '').toLowerCase().includes(query) // Estimated arrival date
        );

        // Combine all filters
        return productMatch || orderMatch;
      })
      : transferOrderList

    return getOrderCounts(filteredBaseList);
  }, [searchQuery, transferOrderList]);

  // Append counts to tabs
  const tabsWithCounts = useMemo(() => {
    return transferStatusTabs?.map(tab => `${tab} (${counts[tab] || 0})`);
  }, [counts]);

  const searchedOrders = getFilteredOrders()?.filter(order => {

    const query = searchQuery.toLowerCase();
    const isNumberQuery = !isNaN(query) && query.trim() !== '';

    // Check if any product detail contains the search query
    const productMatch = order?.transferOrderVariants?.some(product => {
      const productTitle = (product.productTitle || '').toLowerCase();
      const size = (typeof product.size === 'string' ? product.size : '').toLowerCase();
      const colorCode = (product.colorCode || '').toLowerCase();
      const colorName = (product.colorName || '').toLowerCase();
      const quantity = (product.quantity || '').toString(); // Assuming quantity is a number

      return (
        productTitle.includes(query) ||
        size.includes(query) ||
        colorCode.includes(query) ||
        colorName.includes(query) ||
        (isNumberQuery && quantity === query)
      );
    });

    // Check if order details match the search query
    const orderMatch = (
      (order.transferOrderNumber || '').toLowerCase().includes(query) || // Order number
      (order.origin.locationName || '').toLowerCase().includes(query) ||  // Origin location name
      (order.origin.contactPersonName || '').toLowerCase().includes(query) || // Origin contact person
      (order.origin.cityName || '').toLowerCase().includes(query) || // Origin city name
      (order.destination.locationName || '').toLowerCase().includes(query) ||  // Destination location name
      (order.destination.contactPersonName || '').toLowerCase().includes(query) || // Destination contact person
      (order.destination.cityName || '').toLowerCase().includes(query) || // Destination city name
      (order.status || '').toLowerCase().includes(query) || // Order status
      (order.estimatedArrival || '').toLowerCase().includes(query) // Estimated arrival date
    );

    // Combine all filters
    return productMatch || orderMatch;
  });

  const filteredOrders = searchQuery ? searchedOrders : getFilteredOrders();

  const paginatedOrders = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders?.slice(startIndex, endIndex);
  }, [filteredOrders, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders?.length / itemsPerPage);

  const handleGoToEditPage = (id) => {
    router.push(`/product-hub/transfers/${id}`);
  };

  const handleGoToTransferPage = () => {
    router.push(`/product-hub/transfers/create-transfer`);
  }

  useEffect(() => {
    if (paginatedOrders?.length === 0) {
      setPage(0); // Reset to the first page if no data
    }
  }, [paginatedOrders]);

  if (isTransferOrderPending || isUserLoading) return <Loading />;

  return (
    <div className='relative w-full min-h-[calc(100vh-60px)] bg-gray-50 px-6'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
      />
      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      />
      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-0 xl:top-10 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] xl:left-[29%] 2xl:left-[32%] bg-no-repeat'
      />

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
              <Button onClick={handleDeselectAll} size="sm" color="default" variant="flat">
                Deselect All
              </Button>
              <Button onClick={handleSelectAll} size="sm" color="primary" variant="flat">
                Select All
              </Button>
            </div>
            <Button variant="solid" color="primary" size='sm' onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className='max-w-screen-2xl mx-auto relative'>

        <div className='flex flex-wrap md:flex-nowrap items-center justify-between py-2 md:py-5 gap-2 w-full'>

          <h3 className='text-center md:text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>TRANSFERS</h3>

          {isAuthorized &&
            <button onClick={handleGoToTransferPage} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[14px] text-neutral-700">
              <FaPlus size={15} className='text-neutral-700' /> ADD
            </button>
          }

        </div>

        <div className='flex flex-wrap lg:flex-nowrap justify-between items-center gap-6 w-full'>
          <div className='flex-1'>
            <TabsOrder
              tabs={tabsWithCounts}
              selectedTab={`${selectedTab} (${counts[selectedTab] || 0})`} // Pass the selected tab with the count
              onTabChange={(tab) => setSelectedTab(tab.split(' (')[0])} // Extract the tab name without the count
            />
          </div>

          <div>
            <button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-semibold text-[14px] text-neutral-700" onClick={() => { setColumnModalOpen(true) }}>
              Choose Columns <TbColumnInsertRight size={20} />
            </button>
          </div>

          {/* Search Product Item */}
          <div className='flex-1 min-w-[300px]'>
            <li className="flex items-center relative group">
              <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                <g>
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                </g>
              </svg>
              <input
                type="search"
                placeholder="Search by transfer details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
              />
            </li>
          </div>

        </div>

        {/* Table */}
        <div className="max-w-screen-2xl mx-auto custom-max-h-orders overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg mt-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                {columnOrder.map((column) => selectedColumns.includes(column) && (
                  <th key={column} className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">{column}</th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-80">
                    No purchase orders found. Please adjust your filters or check back later.
                  </td>
                </tr>
              ) : (
                paginatedOrders?.map((order, index) => {
                  const totals = order?.transferOrderVariants?.reduce(
                    (acc, variant) => {
                      acc.totalQuantity += variant.quantity || 0;
                      acc.totalAccept += variant.accept || 0;
                      acc.totalReject += variant.reject || 0;
                      return acc;
                    },
                    { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
                  );
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      {columnOrder.map(
                        (column) =>
                          selectedColumns.includes(column) && (
                            <>
                              {column === 'Purchase order' && (
                                <td key="Purchase order" onClick={() => handleGoToEditPage(order?._id)}
                                  className={`text-sm p-3 cursor-pointer text-blue-600 hover:text-blue-800 text-center`}>
                                  {order?.transferOrderNumber}
                                </td>
                              )}
                              {column === 'Origin' && (
                                <td key="Origin" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {order?.origin?.locationName}
                                </td>
                              )}
                              {column === 'Destination' && (
                                <td key="Destination" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {order?.destination?.locationName}
                                </td>
                              )}
                              {column === 'Status' && (
                                <td key="Status" className="text-xs p-3 font-semibold text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full
              ${order?.status === "pending" ? "bg-yellow-100 text-yellow-600"
                                        : order?.status === "received" ? "bg-green-100 text-green-600"
                                          : order?.status === "canceled" ? "bg-red-100 text-red-600"
                                            : "bg-gray-100 text-gray-600"}`}
                                  >
                                    {order?.status === "pending" ? "Pending"
                                      : order?.status === "received" ? "Received"
                                        : order?.status === "canceled" ? "Canceled"
                                          : "Unknown"}
                                  </span>
                                </td>
                              )}
                              {column === 'Received' && (
                                <td key="Received" className="text-sm p-3 text-neutral-500 font-semibold">
                                  <div className='flex flex-col'>
                                    <Progressbar
                                      accepted={totals?.totalAccept}
                                      rejected={totals?.totalReject}
                                      total={totals?.totalQuantity}
                                    />
                                    <div className="mt-1">
                                      {totals?.totalAccept} of {totals?.totalQuantity}
                                    </div>
                                  </div>
                                </td>
                              )}
                              {column === 'Expected Arrival' && (
                                <td key="Expected Arrival" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {order?.estimatedArrival}
                                </td>
                              )}
                            </>
                          )
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Button */}
        <div className="flex flex-col mt-2 md:flex-row gap-4 justify-center items-center relative">
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

    </div>
  );
};

export default Transfers;