"use client";
import CustomPagination from '@/app/components/shared/pagination/CustomPagination';
import Loading from '@/app/components/shared/Loading/Loading';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import useOrders from '@/app/hooks/useOrders';
import { Button, Checkbox, CheckboxGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useCustomers from '@/app/hooks/useCustomers';
import { FaCrown, FaMedal, FaRegUser, FaStar, FaCheck } from 'react-icons/fa6';
import { RxCross2 } from "react-icons/rx";
import { MdWorkspacePremium } from "react-icons/md";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import dynamic from 'next/dynamic';
import { TbColumnInsertRight } from 'react-icons/tb';
import PaginationSelect from '@/app/components/shared/pagination/PaginationSelect';
const CustomerPrintButton = dynamic(() => import("@/app/components/customers/CustomerPrintButton"), { ssr: false });

const initialColumns = ['Customer ID', 'Customer Name', 'Email', 'Phone Number', 'Order History', 'City', 'Postal Code', 'Street Address', 'Preferred Payment Method', 'Shipping Method', 'Alt. Phone Number', 'NewsLetter', 'Hometown', 'Status'];

const Customers = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenCustomerModal, onOpen: openCustomerModal, onClose: onCloseCustomerModal } = useDisclosure();
  const [orderList, isOrderListPending] = useOrders();
  const [customerDetails, isCustomerPending] = useCustomers();
  const axiosPublic = useAxiosPublic();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState({});
  const [columnOrder, setColumnOrder] = useState(initialColumns);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem('selectedCustomer'));
    const savedCustomerColumns = JSON.parse(localStorage.getItem('selectedCustomerColumns'));

    if (savedColumns) {
      setSelectedColumns(savedColumns);
    } else {
      // Set to default if no saved columns exist
      setSelectedColumns(initialColumns);
    }

    if (savedCustomerColumns) {
      setColumnOrder(savedCustomerColumns);
    } else {
      // Set to default column order if no saved order exists
      setColumnOrder(initialColumns);
    }

  }, []);

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
    localStorage.setItem('selectedCustomer', JSON.stringify(selectedColumns));
    localStorage.setItem('selectedCustomerColumns', JSON.stringify(columnOrder));
    setColumnModalOpen(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columnOrder);
    const [draggedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, draggedColumn);

    setColumnOrder(reorderedColumns); // Update the column order both in modal and table
  };

  const { data: { result, totalCustomerList } = [], isCustomerListPending, refetch } = useQuery({
    queryKey: ["customerList", page, itemsPerPage],
    queryFn: async () => {
      const res = await axiosPublic.get(`/customerList?page=${page}&itemsPerPage=${itemsPerPage}`);
      return res?.data;
    },
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Error fetching customer list:', err);
    }
  });

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setPage(0); // Reset to first page when changing items per page
  };

  const handleViewClick = async (orderId) => {
    const orderDetails = orderList?.filter(order => order?.customerInfo?.customerId === orderId);
    setSelectedOrder(orderDetails);
    onOpen();
  };

  const handleCustomerInfoClick = (customer) => {
    setSelectedCustomerInfo(customer);
    openCustomerModal();
  }

  const combinedData = useMemo(() => {
    return customerDetails?.map((customer) => {
      const { userInfo } = customer;
      const personalInfo = userInfo?.personalInfo || {};
      const deliveryAddresses = userInfo?.deliveryAddresses || [];
      const customerOrders = (orderList || []).filter(order => order?.customerInfo?.customerId === userInfo?.customerId);

      const aggregatedOrderDetails = customerOrders.reduce((acc, order) => {
        acc.paymentMethods.add(order?.paymentInfo?.paymentMethod);
        acc.shippingMethods.add(order?.deliveryInfo?.deliveryMethod);
        acc.orderNumber.add(order?.orderNumber);
        acc.total.add(order?.total);
        return acc;
      }, {
        paymentMethods: new Set(),
        shippingMethods: new Set(),
        orderNumber: new Set(),
        total: new Set(),
      });

      // Extract unique values for delivery address fields
      const uniqueCities = Array.from(new Set(deliveryAddresses.map(address => address.city))).join(", ") || "--";
      const uniquePostalCodes = Array.from(new Set(deliveryAddresses.map(address => address.postalCode))).join(", ") || "--";
      const uniqueStreetAddresses = Array.from(new Set(deliveryAddresses.map(address => `${address.address1} ${address.address2}`.trim()))).join(" | ") || "--";

      return {
        customerId: userInfo?.customerId,
        email: customer?.email,
        dob: customer?.userInfo?.personalInfo?.dob,
        customerName: personalInfo?.customerName || "--",
        phoneNumber: personalInfo?.phoneNumber || "--",
        city: uniqueCities,
        postalCode: uniquePostalCodes,
        streetAddress: uniqueStreetAddresses,
        paymentMethods: Array.from(aggregatedOrderDetails.paymentMethods).join(', ') || "--",
        shippingMethods: Array.from(aggregatedOrderDetails.shippingMethods).join(', ') || "--",
        alternativePhoneNumber: personalInfo?.phoneNumber2 || "--",
        hometown: personalInfo.hometown || "--",
        isNewsletterSubscribe: userInfo?.isNewsletterSubscribe,
        score: userInfo?.score,
        orderNumber: Array.from(aggregatedOrderDetails?.orderNumber),
        total: Array.from(aggregatedOrderDetails?.total),
      };
    });
  }, [customerDetails, orderList]);

  const filteredData = useMemo(() => {
    const normalizeString = (value) => (value ? value.toString().toLowerCase() : '');

    const doesCustomerMatchSearch = (customer, searchTerm) => {
      return (
        normalizeString(customer.customerId).includes(searchTerm) ||
        normalizeString(customer.customerName).includes(searchTerm) ||
        normalizeString(customer.email).includes(searchTerm) ||
        normalizeString(customer.phoneNumber).includes(searchTerm) ||
        normalizeString(customer.city).includes(searchTerm) ||
        normalizeString(customer.postalCode).includes(searchTerm) ||
        normalizeString(customer.streetAddress).includes(searchTerm) ||
        normalizeString(customer.paymentMethods).includes(searchTerm) ||
        normalizeString(customer.shippingMethods).includes(searchTerm) ||
        normalizeString(customer.alternativePhoneNumber).includes(searchTerm) ||
        normalizeString(customer.hometown).includes(searchTerm) ||
        normalizeString(customer.score).includes(searchTerm) ||
        normalizeString(customer.orderNumber).includes(searchTerm) ||
        normalizeString(customer.total).includes(searchTerm)
      );
    };

    if (!searchQuery) return combinedData;

    const searchTerm = searchQuery.toLowerCase();
    return combinedData.filter((customer) => doesCustomerMatchSearch(customer, searchTerm));
  }, [combinedData, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);  // Reset to the first page
  };

  const isFiltering = searchQuery.length > 0;

  const totalPage = isFiltering
    ? Math.ceil(filteredData.length / itemsPerPage)
    : Math.ceil(totalCustomerList / itemsPerPage);
  const pages = Array.from({ length: totalPage }, (_, i) => i);

  const paginatedData = useMemo(() => {
    const start = page * itemsPerPage;
    return filteredData?.slice(start, start + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const statusColors = {
    standard: 'bg-gray-400',      // Light gray for basic
    bronze: 'bg-orange-700',    // Softer orange for bronze
    silver: 'bg-gray-600',      // Softer gray for silver
    gold: 'bg-yellow-800',      // Softer yellow for gold
    premium: 'bg-orange-900'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'standard':
        return <FaRegUser />; // User icon for basic
      case 'bronze':
        return <FaMedal className="mr-1" />; // Medal icon for bronze
      case 'silver':
        return <FaStar className="mr-2" />; // Star icon for silver
      case 'gold':
        return <FaCrown className="mr-3" />; // Crown icon for gold
      case 'premium':
        return <MdWorkspacePremium size={15} />; // Crown icon for gold
      default:
        return null; // Default icon if status is unknown
    }
  };

  // if (isCustomerListPending || isOrderListPending || isCustomerPending || isUserLoading) {
  //   return <Loading />
  // };

  if (isCustomerListPending || isOrderListPending || isCustomerPending) {
    return <Loading />
  };

  return (
    <div className='relative w-full min-h-[calc(100vh-60px)] bg-gray-50'>

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
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[35%] xl:left-[34%] 2xl:left-[39%] bg-no-repeat'
      />

      <div className='max-w-screen-2xl px-6 mx-auto'>

        <div className='flex flex-wrap lg:flex-nowrap gap-2 lg:gap-0 justify-center md:justify-between py-2 md:py-5'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-2xl xl:text-3xl text-neutral-700'>CUSTOMER MANAGEMENT</h3>

          <div className='flex flex-wrap xl:flex-nowrap items-center justify-center gap-2 w-full'>
            <div className='w-full'>

              {/* Search Product Item */}
              <li className="flex items-center relative group w-full cursor-pointer">
                <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon cursor-pointer" aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  placeholder="Search By Customer Details..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
                />
              </li>
            </div>

            <div className='flex items-center max-w-screen-2xl mx-auto justify-center md:justify-end md:gap-6 w-full'>
              <button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[12px] xl:text-[14px] text-neutral-700" onClick={() => { setColumnModalOpen(true) }}>
                Choose Columns <TbColumnInsertRight size={20} />
              </button>

            </div>
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

        {/* table content */}
        <div className="max-w-screen-2xl mx-auto custom-max-h overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                {columnOrder.map((column) => selectedColumns.includes(column) && (
                  <th key={column} className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">

              {paginatedData?.length === 0 ? (
                <tr className='relative'>
                  <td colSpan={selectedColumns.length} className="text-center p-4 text-gray-500 pt-24">
                    No orders found matching your criteria. Please adjust your filters or check back later.
                  </td>
                </tr>
              ) : (
                paginatedData?.map((customer, index) => {
                  return (
                    <tr key={customer?._id || index} className="hover:bg-gray-50 bg-white transition-colors">

                      {columnOrder.map(
                        (column) =>
                          selectedColumns.includes(column) && (
                            <>
                              {column === 'Customer ID' && (
                                // <td key="customerId" onClick={isAuthorized ? () => handleCustomerInfoClick(customer) : undefined} className={`text-xs p-3 font-mono text-center ${isAuthorized ? "cursor-pointer text-blue-600 hover:text-blue-800" : "text-neutral-800"}`}>
                                //   {customer?.customerId}
                                // </td>
                                <td key="customerId" onClick={() => handleCustomerInfoClick(customer)} className={`text-xs p-3 font-mono text-center cursor-pointer text-blue-600 hover:text-blue-800`}>
                                  {customer?.customerId}
                                </td>
                              )}
                              {column === 'Customer Name' && (
                                <td key="customerName" className="text-xs p-3 text-gray-700 uppercase">
                                  {customer?.customerName}
                                </td>
                              )}
                              {column === 'Email' && (
                                <td key="email" className={`text-xs p-3 text-gray-700`}>
                                  {customer?.email}
                                </td>
                              )}
                              {column === 'Phone Number' && (
                                <td key="phoneNumber" className="text-xs text-center p-3 text-gray-700">
                                  {customer?.phoneNumber}
                                </td>
                              )}
                              {column === 'Order History' && (
                                <td>
                                  {/* {customer?.paymentMethods === "--" ? <p className='text-center'>--</p> : <p key="orderHistory" onClick={isAuthorized ? () => handleViewClick(customer?.customerId) : undefined} className={`text-xs p-3 font-mono text-center ${isAuthorized ? "cursor-pointer text-blue-600 hover:text-blue-800" : "text-neutral-800"}`}>
                                    View
                                  </p>} */}
                                  {customer?.paymentMethods === "--" ? <p className='text-center'>--</p> : <p key="orderHistory" onClick={() => handleViewClick(customer?.customerId)} className={`text-xs p-3 font-mono text-center cursor-pointer text-blue-600 hover:text-blue-800`}>
                                    View
                                  </p>}
                                </td>
                              )}
                              {column === 'City' && (
                                <td key="city" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.city}
                                </td>
                              )}
                              {column === 'Postal Code' && (
                                <td key="postalCode" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.postalCode}
                                </td>
                              )}
                              {column === 'Street Address' && (
                                <td key="streetAddress" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.streetAddress}
                                </td>
                              )}
                              {column === 'Preferred Payment Method' && (
                                <td key="paymentMethod" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.paymentMethods}
                                </td>
                              )}
                              {column === 'Shipping Method' && (
                                <td key="shippingMethod" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.shippingMethods}
                                </td>
                              )}
                              {column === 'Alt. Phone Number' && (
                                <td key="altPhoneNumber" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.alternativePhoneNumber}
                                </td>
                              )}
                              {column === 'NewsLetter' && (
                                <td key="newsLetter" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.isNewsletterSubscribe ? <FaCheck className='text-blue-600' size={20} /> : <RxCross2 className='text-red-600' size={26} />}
                                </td>
                              )}
                              {column === 'Hometown' && (
                                <td key="hometown" className="text-xs p-3 text-gray-700 text-center">
                                  {customer?.hometown}
                                </td>
                              )}
                              {column === 'Status' && (
                                <td key="status" className="text-xs p-3 text-gray-700 whitespace-nowrap text-center">
                                  {customer?.score}
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

        {selectedOrder && (
          <Modal className='mx-4 lg:mx-0' isOpen={isOpen} onOpenChange={onClose} size='2xl'>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1 bg-gray-200 px-8">
                Order History
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                {selectedOrder?.length > 0 ?
                  (
                    selectedOrder.map((order, index) => (
                      <div key={index} className={`bg-white px-5 md:px-10 py-5 rounded-lg flex flex-col md:flex-row justify-between ${selectedOrder.length > 1 ? "border" : ""}`}>
                        <div>
                          <p className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                            <strong>Order ID : </strong><CustomerPrintButton selectedOrder={order} />
                          </p>
                          <p className='text-sm font-medium text-gray-700'>
                            <span className="font-semibold">Order Amount:</span> ৳ {order?.total?.toFixed(2)}
                          </p>
                          <p className='text-sm font-medium text-gray-700'>
                            <span className="font-semibold">Payment Method:</span> {order?.paymentInfo?.paymentMethod}
                          </p>
                          <p className='text-sm font-medium text-gray-700'>
                            <span className="font-semibold">Shipping Method:</span> {order?.deliveryInfo?.deliveryMethod}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-700'>
                            <span className="font-semibold">Date & Time:</span> {order?.dateTime}
                          </p>
                          <p className='text-sm font-medium text-gray-700'>
                            <span className="font-semibold">Order Status:</span> {order?.orderStatus}
                          </p>
                        </div>
                      </div>
                    ))
                  )
                  : (
                    <div className="text-center py-6">
                      <p className="text-gray-700 text-lg font-medium">This customer has not ordered anything yet.</p>
                    </div>
                  )}
              </ModalBody>
              <ModalFooter className={`flex justify-end border-gray-300 pt-2 ${selectedOrder.length > 1 ? "" : "border"}`}>
                <Button onPress={onClose} color="danger" variant='flat' size='sm'>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {selectedCustomerInfo && (
          <Modal className='mx-4 lg:mx-0' isOpen={isOpenCustomerModal} onOpenChange={onCloseCustomerModal} size='xl'>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1 bg-gray-200 px-8">
                Customer Informations
              </ModalHeader>
              <ModalBody className="modal-body-scroll mt-4 mb-2 mx-2">
                <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Preferred Payment Methods:</span> <span className='text-neutral-800'>{selectedCustomerInfo?.paymentMethods}</span></p>
                <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Alt. Phone Number:</span> <span className='text-neutral-800'>{selectedCustomerInfo?.alternativePhoneNumber}</span></p>
                <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Shipping Methods :</span> <span className='text-neutral-800'>{selectedCustomerInfo?.shippingMethods}</span></p>
                <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Date of Birth :</span> <span className='text-neutral-800'>{selectedCustomerInfo?.dob}</span></p>
                <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Addresses:</span> <span className='text-neutral-800'>{selectedCustomerInfo?.streetAddress}</span></p>
                <div className='flex flex-wrap items-center justify-between pr-10'>
                  <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Cities :</span> <span className='text-neutral-800'>{selectedCustomerInfo?.city}</span></p>
                  <p className='text-xs md:text-sm'><span className='text-neutral-950 font-semibold'>Postal Codes :</span> <span className='text-neutral-800'>{selectedCustomerInfo?.postalCode}</span></p>
                </div>
              </ModalBody>
              <ModalFooter className='border'>
                <Button color="danger" variant='flat' size='sm' onPress={onCloseCustomerModal}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center relative mt-2">
          <CustomPagination
            totalPages={pages.length}
            currentPage={page}
            onPageChange={setPage}
          />
          <PaginationSelect
            options={[25, 50, 100]} // ✅ Pass available options
            value={itemsPerPage} // ✅ Selected value
            onChange={handleItemsPerPageChange} // ✅ Handle value change
          />
        </div>

      </div >

    </div>
  );
};

export default Customers;