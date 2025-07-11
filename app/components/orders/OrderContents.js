"use client";
import * as XLSX from 'xlsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionItem, Button, Checkbox, CheckboxGroup, DateRangePicker, Input, Textarea } from "@nextui-org/react";
import Loading from '@/app/components/shared/Loading/Loading';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import { FaUndo } from 'react-icons/fa';
import Barcode from '@/app/components/layout/Barcode/Barcode';
import { IoMdClose } from 'react-icons/io';
import Papa from 'papaparse';
import useOrders from '@/app/hooks/useOrders';
import CustomPagination from '@/app/components/shared/pagination/CustomPagination';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { today, getLocalTimeZone } from "@internationalized/date";
import dynamic from 'next/dynamic';
import useShippingZones from '@/app/hooks/useShippingZones';
import Image from 'next/image';
import { saveAs } from 'file-saver';
import { HiDownload } from "react-icons/hi";
import { CgArrowsExpandRight } from 'react-icons/cg';
import ProductExpandedImageModalOrder from '@/app/components/layout/product/ProductExpandedImageModalOrder';
import { TbColumnInsertRight } from 'react-icons/tb';
import { HiOutlineDownload } from "react-icons/hi";
import PaginationSelect from '@/app/components/shared/pagination/PaginationSelect';
import { useAuth } from '@/app/contexts/auth';
import TabsOrder from '@/app/components/shared/tabs/TabsOrder';
import { useSearchParams } from 'next/navigation';
import { placeShipmentOrder } from '@/app/utils/shipping/placeShipmentOrder';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const PrintButton = dynamic(() => import("@/app/components/orders/PrintButton"), { ssr: false });

const initialColumns = ['Order Number', 'Date & Time', 'Customer Name', 'Order Amount', 'Order Status', 'Action', 'Email', 'Phone Number', 'Alt. Phone Number', 'Shipping Method', 'Payment Status', 'Payment Method'];

const orderStatusTabs = [
  'New Orders',
  'Active Orders',
  'Completed Orders',
  'Returns & Refunds',
];

const columnsConfig = {
  'New Orders': [...initialColumns],
  'Active Orders': [...initialColumns],
  'Completed Orders': [...initialColumns],
  'Returns & Refunds': ['R. Order Number', 'Date & Time', 'Customer Name', 'Refund Amount', 'Status', 'Action', 'Email', 'Phone Number', 'Alt. Phone Number', 'Shipping Method', 'Payment Status', 'Payment Method'],
};

const currentModule = "Orders";

const OrderContents = () => {
  const searchParams = useSearchParams();
  const promo = searchParams.get("promo");
  const offer = searchParams.get("offer");
  const orderNumber = searchParams.get("orderNumber");
  const orderStatus = searchParams.get("orderStatus");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderList, isOrderListPending, refetchOrder] = useOrders();
  const axiosSecure = useAxiosSecure();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDropdown2, setOpenDropdown2] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRefDownload = useRef(null);
  const [selectedTab, setSelectedTab] = useState(orderStatusTabs[0]);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [selectedColumns, setSelectedColumns] = useState(columnsConfig[selectedTab]);
  const [columnOrder, setColumnOrder] = useState(columnsConfig[selectedTab]);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderIdToUpdate, setOrderIdToUpdate] = useState(null); // Store order ID
  const [orderToUpdate, setOrderToUpdate] = useState({}); // selected order for update
  const [isTrackingModalOpen, setTrackingModalOpen] = useState(false);
  const [orderIdToUpdateOnHold, setOrderIdToUpdateOnHold] = useState(null); // Store order ID
  const [orderToUpdateOnHold, setOrderToUpdateOnHold] = useState({}); // selected order for update
  const [onHoldReason, setOnHoldReason] = useState("");
  const [isOnHoldModalOpen, setOnHoldModalOpen] = useState(false);
  const [orderIdToUpdateDeclined, setOrderIdToUpdateDeclined] = useState(null); // Store order ID
  const [orderToUpdateDeclined, setOrderToUpdateDeclined] = useState({}); // selected order for update
  const [declinedReason, setDeclinedReason] = useState("");
  const [isDeclinedModalOpen, setDeclinedModalOpen] = useState(false);
  const [shippingList, isShippingPending] = useShippingZones();
  const [selectedHandler, setSelectedHandler] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  // Load saved state from localStorage or use defaults
  useEffect(() => {
    const cleanTab = selectedTab.split(" (")[0]; // Clean the tab name
    const savedSelectedColumns = JSON.parse(localStorage.getItem(`selectedColumns_${cleanTab}`));
    const savedColumnOrder = JSON.parse(localStorage.getItem(`columnOrder_${cleanTab}`));
    const allColumns = columnsConfig[cleanTab]; // Default columns for the tab

    if (savedSelectedColumns && savedColumnOrder) {
      // Ensure all columns are shown in the modal (unselected columns included)
      const completeColumns = allColumns.map((col) =>
        savedSelectedColumns.includes(col) ? col : col
      );
      setSelectedColumns(savedSelectedColumns);
      setColumnOrder(savedColumnOrder.filter((col) => completeColumns.includes(col)));
    } else {
      // Fallback to default columns if nothing is saved
      setSelectedColumns(allColumns);
      setColumnOrder(allColumns);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (searchQuery) {
      refetchOrder();  // RefetchOrders when search query changes
    }
  }, [searchQuery, refetchOrder]);

  useEffect(() => {
    // Set the search query to promo or offer
    if (promo) {
      setSearchQuery(promo);
    } if (offer) {
      setSearchQuery(offer);
    }
    if (orderNumber) {
      setSearchQuery(orderNumber)
    }
    if (orderStatus === "Return Requested") {
      setSelectedTab("Returns & Refunds")
    }
  }, [promo, offer, orderNumber, orderStatus]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRefDownload.current && !dropdownRefDownload.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown2(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handler for selecting a shipment handler
  const handleSelectHandler = async (handler) => {
    try {
      setSelectedHandler(handler);

      const tracking = await placeShipmentOrder(handler, orderToUpdate);

      if (tracking) {
        setTrackingNumber(tracking);
        toast.success("Tracking number generated from " + handler.shipmentHandlerName);
      }
    } catch (err) {
      toast.error("Failed to generate tracking number from " + handler.shipmentHandlerName);
      console.error(err);
    }
  };

  const handleColumnChange = (selected) => {
    setSelectedColumns(selected);
  };

  const handleSelectAll = () => {
    setSelectedColumns(columnsConfig[selectedTab]);
    setColumnOrder(columnsConfig[selectedTab]);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSave = () => {
    const cleanTab = selectedTab.split(" (")[0]; // Clean the tab name
    localStorage.setItem(`selectedColumns_${cleanTab}`, JSON.stringify(selectedColumns));
    localStorage.setItem(`columnOrder_${cleanTab}`, JSON.stringify(columnOrder));
    setColumnModalOpen(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columnOrder);
    const [draggedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, draggedColumn);

    setColumnOrder(reorderedColumns);
    setSelectedColumns((prevSelected) =>
      reorderedColumns.filter((col) => prevSelected.includes(col))
    );
  };

  // Convert dateTime string to Date object
  const parseDate = (dateString) => {
    const [date, time] = dateString.split(' | ');
    const [day, month, year] = date.split('-').map(num => parseInt(num, 10));
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    return new Date(year + 2000, month - 1, day, hours, minutes);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const currentDate = today(getLocalTimeZone());

  const handleReset = () => {
    setSelectedDateRange(null); // Reset the selected date range
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown)); // Toggle the clicked dropdown
  };

  const toggleDropdown2 = (dropdown) => {
    setOpenDropdown2((prev) => (prev === dropdown ? null : dropdown)); // Toggle the clicked dropdown
  };

  // Check if filters are applied
  const isFilterActive = searchQuery || (selectedDateRange?.start && selectedDateRange?.end);

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setPage(0); // Reset to first page when changing items per page
  };

  // Function to get filtered orders based on the selected tab and sort by last status change
  const getFilteredOrders = () => {
    const cleanTab = selectedTab.split(' (')[0];
    let filtered = [];

    switch (cleanTab) {
      case 'New Orders':
        filtered = orderList?.filter(order => order?.orderStatus === 'Pending');
        break;
      case 'Active Orders':
        filtered = orderList?.filter(order => ['Processing', 'Shipped', 'On Hold'].includes(order?.orderStatus));
        break;
      case 'Completed Orders':
        filtered = orderList?.filter(order => order?.orderStatus === 'Delivered');
        break;
      case 'Returns & Refunds':
        filtered = orderList?.filter(order => ['Return Requested', 'Request Accepted', 'Request Declined', 'Return Initiated', 'Refunded'].includes(order?.orderStatus));
        break;
      default:
        filtered = orderList;
    }

    // Sort the filtered orders based on last status change, most recent first
    return filtered?.sort((a, b) => new Date(b.lastStatusChange) - new Date(a.lastStatusChange));
  };

  // Filter orders based on search query and date range
  const searchedOrders = getFilteredOrders()?.filter(order => {

    const query = searchQuery.toLowerCase();
    const isNumberQuery = !isNaN(query) && query.trim() !== '';

    // Date range filtering
    const orderDate = parseDate(order.dateTime);
    const isDateInRange = startDate && adjustedEndDate
      ? (orderDate >= startDate && orderDate <= adjustedEndDate)
      : true;

    // Check if any product detail contains the search query
    const productMatch = order?.productInformation?.some(product => {
      const productTitle = (product?.productTitle || '').toString().toLowerCase();
      const productId = (product?.productId || '').toString().toLowerCase();
      const size = (typeof product?.size === 'string' ? product.size : '').toLowerCase();
      const color = (product?.color?.label || '').toString().toLowerCase();
      const batchCode = (product?.batchCode || '').toString().toLowerCase();
      const offerTitle = (product?.offerInfo?.offerTitle || '').toString().toLowerCase();
      const offerDiscountValue = (product?.offerInfo?.offerDiscountValue || '').toString();
      const sku = (product?.sku || '').toString(); // SKU might be numeric, so keep it as a string

      return (
        productTitle.includes(query) ||
        productId.includes(query) ||
        size.includes(query) ||
        color.includes(query) ||
        batchCode.includes(query) ||
        offerTitle.includes(query) ||
        offerDiscountValue.includes(query) ||
        (isNumberQuery && sku === query) // Numeric comparison for SKU
      );
    });

    // Check if order details match the search query
    const orderMatch = (
      (order?.orderNumber || '').toLowerCase().includes(query) ||
      (order?.dateTime || '').toLowerCase().includes(query) ||
      (order?.customerInfo?.customerName || '').toLowerCase().includes(query) || // Added customerName search
      (order?.customerInfo?.email || '').toLowerCase().includes(query) ||
      (order?.customerInfo?.phoneNumber || '').toString().includes(query) ||
      (order?.customerInfo?.phoneNumber2 || '').toString().includes(query) ||
      (order?.deliveryInfo?.address1 || '').toLowerCase().includes(query) ||
      (order?.deliveryInfo?.address2 || '').toLowerCase().includes(query) ||
      (order?.deliveryInfo?.city || '').toLowerCase().includes(query) ||
      (order?.deliveryInfo?.postalCode || '').toString().includes(query) ||
      (order?.orderStatus || '').toLowerCase().includes(query) ||
      (order?.total || '').toString().includes(query) ||
      (order?.paymentInfo?.paymentMethod || '').toLowerCase().includes(query) ||
      (order?.promoInfo?.promoDiscountValue || '').toString().includes(query) ||
      (order?.promoInfo?.promoCode || '').toLowerCase().includes(query) ||
      (order?.paymentInfo?.transactionId || '').toLowerCase().includes(query) ||
      String(order?.shipmentInfo?.trackingNumber || '').toLowerCase().includes(query) ||
      (order?.shipmentInfo?.selectedShipmentHandlerName || '').toLowerCase().includes(query) ||
      (order?.deliveryInfo?.deliveryMethod || '').toLowerCase().includes(query) ||
      (order?.paymentInfo?.paymentStatus || '').toLowerCase().includes(query) ||
      (order?.customerInfo?.customerId || '').toLowerCase().includes(query) ||
      (order?.returnInfo?.reason || '').toLowerCase().includes(query) ||
      (order?.returnInfo?.issue || '').toLowerCase().includes(query) ||
      (order?.returnInfo?.description || '').toLowerCase().includes(query) ||
      (order?.returnInfo?.refundAmount || '').toString().includes(query)
    );

    // Check if query matches date in specific format
    const dateMatch = (order?.dateTime || '').toLowerCase().includes(query);

    // Check if promo or offer exists and the order is 'Paid'
    const isPromoOrOffer = promo || offer;
    const isPaidOrder = order?.paymentInfo?.paymentStatus === 'Paid';

    // Combine all filters
    return isDateInRange && (productMatch || orderMatch || dateMatch) && (!isPromoOrOffer || isPaidOrder);
  });

  // Filtered orders based on the selected tab
  const filteredOrders = isFilterActive ? searchedOrders : getFilteredOrders();

  const paginatedOrders = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders?.slice(startIndex, endIndex);
  }, [filteredOrders, page, itemsPerPage]);

  // Function to calculate counts for each tab
  const getOrderCounts = (list) => {
    return {
      'New Orders': list?.filter(order => order?.orderStatus === 'Pending').length || 0,
      'Active Orders': list?.filter(order => ['Processing', 'Shipped', 'On Hold'].includes(order?.orderStatus)).length || 0,
      'Completed Orders': list?.filter(order => order?.orderStatus === 'Delivered').length || 0,
      'Returns & Refunds': list?.filter(order => ['Return Requested', 'Request Accepted', 'Request Declined', 'Return Initiated', 'Refunded'].includes(order?.orderStatus)).length || 0,
    };
  };

  // Memoize counts to prevent unnecessary recalculations
  const counts = useMemo(() => {
    const filteredBaseList = isFilterActive
      ? orderList?.filter(order => {
        const query = searchQuery.toLowerCase();
        const isNumberQuery = !isNaN(query) && query.trim() !== '';

        const orderDate = parseDate(order.dateTime);
        const isDateInRange = startDate && adjustedEndDate
          ? (orderDate >= startDate && orderDate <= adjustedEndDate)
          : true;

        const productMatch = order?.productInformation?.some(product => {
          const productTitle = (product?.productTitle || '').toString().toLowerCase();
          const productId = (product?.productId || '').toString().toLowerCase();
          const size = (typeof product?.size === 'string' ? product.size : '').toLowerCase();
          const color = (product?.color?.label || '').toString().toLowerCase();
          const batchCode = (product?.batchCode || '').toString().toLowerCase();
          const offerTitle = (product?.offerInfo?.offerTitle || '').toString().toLowerCase();
          const offerDiscountValue = (product?.offerInfo?.offerDiscountValue || '').toString();
          const sku = (product?.sku || '').toString();

          return (
            productTitle.includes(query) ||
            productId.includes(query) ||
            size.includes(query) ||
            color.includes(query) ||
            batchCode.includes(query) ||
            offerTitle.includes(query) ||
            offerDiscountValue.includes(query) ||
            (isNumberQuery && sku === query)
          );
        });

        const orderMatch = (
          (order?.orderNumber || '').toLowerCase().includes(query) ||
          (order?.dateTime || '').toLowerCase().includes(query) ||
          (order?.customerInfo?.customerName || '').toLowerCase().includes(query) ||
          (order?.customerInfo?.email || '').toLowerCase().includes(query) ||
          (order?.customerInfo?.phoneNumber || '').toString().includes(query) ||
          (order?.customerInfo?.phoneNumber2 || '').toString().includes(query) ||
          (order?.deliveryInfo?.address1 || '').toLowerCase().includes(query) ||
          (order?.deliveryInfo?.address2 || '').toLowerCase().includes(query) ||
          (order?.deliveryInfo?.city || '').toLowerCase().includes(query) ||
          (order?.deliveryInfo?.postalCode || '').toString().includes(query) ||
          (order?.orderStatus || '').toLowerCase().includes(query) ||
          (order?.total || '').toString().includes(query) ||
          (order?.paymentInfo?.paymentMethod || '').toLowerCase().includes(query) ||
          (order?.promoInfo?.promoDiscountValue || '').toString().includes(query) ||
          (order?.promoInfo?.promoCode || '').toLowerCase().includes(query) ||
          (order?.paymentInfo?.transactionId || '').toLowerCase().includes(query) ||
          String(order?.shipmentInfo?.trackingNumber || '').toLowerCase().includes(query) ||
          (order?.shipmentInfo?.selectedShipmentHandlerName || '').toLowerCase().includes(query) ||
          (order?.deliveryInfo?.deliveryMethod || '').toLowerCase().includes(query) ||
          (order?.paymentInfo?.paymentStatus || '').toLowerCase().includes(query) ||
          (order?.customerInfo?.customerId || '').toLowerCase().includes(query) ||
          (order?.returnInfo?.reason || '').toLowerCase().includes(query) ||
          (order?.returnInfo?.issue || '').toLowerCase().includes(query) ||
          (order?.returnInfo?.description || '').toLowerCase().includes(query) ||
          (order?.returnInfo?.refundAmount || '').toString().includes(query)
        );

        const dateMatch = (order?.dateTime || '').toLowerCase().includes(query);
        const isPromoOrOffer = promo || offer;
        const isPaidOrder = order?.paymentInfo?.paymentStatus === 'Paid';

        return isDateInRange && (productMatch || orderMatch || dateMatch) && (!isPromoOrOffer || isPaidOrder);
      })
      : orderList;

    return getOrderCounts(filteredBaseList);
  }, [orderList, searchQuery, startDate, adjustedEndDate, isFilterActive, promo, offer]);

  // Append counts to tabs
  const tabsWithCounts = useMemo(() => {
    return orderStatusTabs?.map(tab => `${tab} (${counts[tab] || 0})`);
  }, [counts]);

  const totalPages = Math.ceil(filteredOrders?.length / itemsPerPage);

  const handleActions = async (id, actionType, isUndo = false) => {

    const order = paginatedOrders?.find(order => order._id === id);

    if (!order) {
      toast.error("Order not found");
      return;
    };

    const dataToSend = order?.productInformation.map(product => ({
      productId: product.productId,
      sku: product.sku,
      onHandSku: product.sku,
      size: product.size,
      color: product.color
    }));

    const returnDataToSend = order?.returnInfo?.products?.map(product => ({
      productId: product.productId,
      sku: product.sku,
      size: product.size,
      color: product.color
    }));

    const actionMessages = {
      undefined: "Do you want to confirm this order?",
      shipped: "Do you want to ship this order?",
      onHold: "Do you want to put this order on hold?",
      delivered: "Do you want to mark this order as delivered?",
      approved: "Do you want to mark this order as accepted?",
      declined: "Do you want to mark this order as declined?",
      returned: "Do you want to mark this order as returned?",
      refunded: "Do you want to refund this order?",
      "": "Do you want to revert this order?"
    };

    Swal.fire({
      title: "Are you sure?",
      text: actionMessages[actionType] || "Action not recognized",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (actionType === undefined) {
          try {
            const response = await axiosSecure.put("/decreaseSkuFromProduct", dataToSend);

            // Check the results array from the response
            const updateResults = response?.data?.results;

            if (updateResults && Array.isArray(updateResults)) {
              const successfulUpdates = updateResults.filter((result) => !result.error); // Filter out successful updates

              if (successfulUpdates.length > 0) {
                updateOrderStatus(order, id, actionType, isUndo); // Call your function only if there are successful updates
              } else {
                console.error("No successful updates occurred");
              }
            } else {
              console.error("Unexpected response format:", response?.data);
            }
          } catch (error) {
            console.error("Error making API request:", error);
          }
        }
        else if (actionType === "shipped") {
          // Open the modal for tracking number input only for 'shipped'
          setOrderToUpdate(order);
          setOrderIdToUpdate(id); // Set the order ID for modal
          setTrackingModalOpen(true);  // Open the modal
        }
        else if (actionType === "onHold") {
          // Open the modal for on hold input only for 'onHold'
          setOrderToUpdateOnHold(order);
          setOrderIdToUpdateOnHold(id); // Set the order ID for modal
          setOnHoldModalOpen(true);  // Open the modal
        }
        else if (actionType === "declined") {
          // Open the modal for on hold input only for 'onHold'
          setOrderToUpdateDeclined(order);
          setOrderIdToUpdateDeclined(id); // Set the order ID for modal
          setDeclinedModalOpen(true);  // Open the modal
        }
        else if (actionType === "refunded") {
          try {
            const response = await axiosSecure.put("/addReturnSkuToProduct", returnDataToSend);

            // Check the results array from the response
            const updateResults = response?.data?.results;

            if (updateResults && Array.isArray(updateResults)) {
              const successfulUpdates = updateResults.filter((result) => !result.error); // Filter out successful updates

              if (successfulUpdates.length > 0) {
                updateOrderStatus(order, id, actionType, isUndo); // Call your function only if there are successful updates
              } else {
                console.error("No successful updates occurred");
              }
            } else {
              console.error("Unexpected response format:", response?.data);
            }
          } catch (error) {
            console.error("Error making API request:", error);
          }
        }
        else {
          // For all other statuses, update order directly
          updateOrderStatus(order, id, actionType, isUndo); // Keep the existing logic for non-shipped actions
        }
      }
    });
  };

  // Function to update order status
  const updateOrderStatus = async (order, id, actionType, isUndo) => {

    const dataToSend = order?.productInformation.map(product => ({
      productId: product.productId,
      sku: product.sku,
      onHandSku: product.sku,
      size: product.size,
      color: product.color
    }));

    const returnDataToSend = order?.returnInfo?.products?.map(product => ({
      productId: product.productId,
      sku: product.sku,
      size: product.size,
      color: product.color
    }));

    let updateStatus;

    if (isUndo) {
      updateStatus = order?.previousStatus; // Revert to previous status if undoing
      // localStorage.removeItem(`undoVisible_${id}`);
    } else {
      switch (actionType) {
        case 'shipped':
          updateStatus = 'Shipped';
          break;
        case 'onHold':
          updateStatus = 'On Hold';
          break;
        case 'delivered':
          updateStatus = 'Delivered';
          break;
        case 'approved':
          updateStatus = 'Request Accepted';
          break;
        case 'declined':
          updateStatus = 'Request Declined';
          break;
        case 'returned':
          updateStatus = 'Return Initiated';
          break;
        case 'refunded':
          updateStatus = 'Refunded';
          break;
        default:
          updateStatus = 'Processing';
          break;
      }
      // localStorage.setItem(`undoVisible_${id}`, true);
    };

    const data = {
      orderStatus: updateStatus,
      ...(actionType === "shipped" && {
        shippedAt: new Date(), // Add shippedAt timestamp
      }),
      ...(actionType === "delivered" && {
        deliveredAt: new Date(), // Add deliveredAt timestamp
      }),
      ...(actionType === "shipped" && trackingNumber ? { trackingNumber } : {}), // Add tracking number if provided for shipped
      ...(actionType === "shipped" && selectedHandler
        ? {
          selectedShipmentHandlerName: selectedHandler?.shipmentHandlerName,
          trackingUrl: selectedHandler?.trackingUrl,
          imageUrl: selectedHandler?.imageUrl,
        }
        : {}), // Add selectedHandler details if provided for shipped
      ...(isUndo && { isUndo: true }),
      ...(actionType === "onHold" && onHoldReason ? { onHoldReason } : {}),
      ...(actionType === "declined" && declinedReason ? { declinedReason } : {}),
      dataToSend,
      returnDataToSend
    };

    try {
      const res = await axiosSecure.patch(`/changeOrderStatus/${id}`, data);
      if (res?.data?.modifiedCount) {
        refetchOrder(); // Refresh orders list
        if (isUndo) {
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
                      Order Updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Order status reverted successfully.
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
          })
        }
        else if (actionType === "shipped") {
          try {
            const response = await axiosSecure.put("/decreaseOnHandSkuFromProduct", dataToSend);

            // Check the results array from the response
            const updateResults = response?.data?.results;

            if (updateResults && Array.isArray(updateResults)) {
              const successfulUpdates = updateResults.filter((result) => !result.error); // Filter out successful updates

              if (successfulUpdates.length > 0) {
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
                            Order Updated!
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Order has been shipped
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
                })
              } else {
                console.error("No successful updates occurred");
              }
            } else {
              console.error("Unexpected response format:", response?.data);
            }
          } catch (error) {
            console.error("Error making API request:", error);
          }
        }
        else {
          sendOrderEmail(actionType); // Send notification email
        }
        refetchOrder();
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error("Error updating order status");
    }
  };

  // Adjust this logic to correctly determine the visibility of the Undo button
  const checkUndoAvailability = (order) => {
    if (!order.undoAvailableUntil) return false;
    return new Date(order.undoAvailableUntil) > new Date(); // Check if undo is still valid
  };

  // sending mail to customer
  const sendOrderEmail = (actionType) => {
    let message;
    let successToastMessage;

    switch (actionType) {
      case 'shipped':
        message = "Your order has been shipped and is on its way to you. You will receive tracking information shortly so you can follow its journey.";
        successToastMessage = "Order has been shipped";
        break;
      case 'delivered':
        message = "Your order has been successfully delivered. We hope you are happy with your purchase. If you have any issues, please contact us.";
        successToastMessage = "Delivered successfully.";
        break;
      case 'onHold':
        message = "We have received your return request and will process it shortly. You will be contacted with further instructions on how to return your items.";
        successToastMessage = "Shipment is on hold.";
        break;
      case 'approved':
        message = "We have received your return request and will process it shortly. You will be contacted with further instructions on how to return your items.";
        successToastMessage = "Approved request has been initiated!";
        break;
      case 'declined':
        message = "We have received your return request and will process it shortly. You will be contacted with further instructions on how to return your items.";
        successToastMessage = "Declined request has been initiated!";
        break;
      case 'returned':
        message = "We have received your return request and will process it shortly. You will be contacted with further instructions on how to return your items.";
        successToastMessage = "Return request has been initiated!";
        break;
      case 'refunded':
        message = "Your refund has been processed successfully. The amount will be credited to your original payment method. Thank you for your patience.";
        successToastMessage = "Customer has been refunded";
        break;
      default:
        message = "Thank you for your order! We have received it and are processing it. You will receive an update once your order is on its way.";
        successToastMessage = "Order confirmation sent successfully";
        break;
    }

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
                Order Updated!
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {successToastMessage}
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
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const exportToCSV = async () => {
    let dataToExport = [];

    // Check if a search query is applied (i.e., if `searchedOrders` is not empty)
    if (searchQuery) {
      dataToExport = searchedOrders;
    }
    // If date range is applied, filter orders based on date range
    else if (startDate && adjustedEndDate) {
      dataToExport = filteredOrders.filter(order => {
        const orderDate = parseDate(order.dateTime);
        return orderDate >= startDate && orderDate <= adjustedEndDate;
      });
    }
    // Otherwise, apply tab-based filtering
    else {
      dataToExport = filteredOrders;
    }

    // Extract only the order-level details for the export
    const filteredData = dataToExport.map(row => {
      const data = {};

      // Loop through columnOrder and include only the selected columns in the correct order
      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case 'Order Number':
              data["Order Number"] = row?.orderNumber;
              break;
            case 'R. Order Number':
              data['R. Order Number'] = row?.orderNumber;
              break;
            case 'Date & Time':
              data['Date & Time'] = row?.dateTime;
              break;
            case 'Customer Name':
              data['Customer Name'] = row?.customerInfo?.customerName;
              break;
            case 'Order Amount':
              data['Order Amount'] = row?.total;
              break;
            case 'Refund Amount':
              data['Refund Amount'] = row?.total;
              break;
            case 'Order Status':
              data['Order Status'] = row?.orderStatus;
              break;
            case 'Status':
              data['Status'] = row?.orderStatus;
              break;
            case 'Email':
              data['Email'] = row?.customerInfo?.email;
              break;
            case 'Phone Number':
              data['Phone Number'] = row?.customerInfo?.phoneNumber;
              break;
            case 'Alt. Phone Number':
              data['Alt. Phone Number'] = row?.customerInfo?.phoneNumber2 || "--";
              break;
            case 'Shipping Method':
              data['Shipping Method'] = row?.deliveryInfo?.deliveryMethod;
              break;
            case 'Payment Status':
              data['Payment Status'] = row?.paymentInfo?.paymentStatus;
              break;
            case 'Payment Method':
              data['Payment Method'] = row?.paymentInfo?.paymentMethod;
              break;
            default:
              break;
          }
        }
      });

      return data;
    });

    // Create the filename dynamically based on applied filters
    let fileName = 'order_data';
    if (searchQuery) fileName += `_searched`;
    else if (startDate && adjustedEndDate) fileName += `_from_${formatDate(startDate)}_to_${formatDate(adjustedEndDate)}`;
    else fileName += `_${selectedTab.replace(/\s/g, '_').toLowerCase()}`;

    // Convert to CSV and trigger download
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");  // Dynamically import jsPDF
    const autoTable = (await import("jspdf-autotable")).default;  // Import jsPDF-AutoTable

    // Create a new document in landscape mode
    const doc = new jsPDF('landscape'); // 'landscape' mode

    // Define the columns based on columnOrder
    const columns = columnOrder
      .filter((col) => selectedColumns.includes(col))  // Ensure only selected columns are included
      .map((col) => ({
        header: col,
        dataKey: col,
      }));

    // Map filtered orders to the correct data format based on columnOrder
    const rows = filteredOrders?.map((order) => {
      const rowData = {};

      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case "Order Number":
              rowData["Order Number"] = order?.orderNumber;
              break;
            case "R. Order Number":
              rowData["R. Order Number"] = order?.orderNumber;
              break;
            case "Date & Time":
              rowData["Date & Time"] = order?.dateTime;
              break;
            case "Customer Name":
              rowData["Customer Name"] = order?.customerInfo?.customerName;
              break;
            case "Order Amount":
              rowData["Order Amount"] = `${order?.total?.toFixed(2)}`;
              break;
            case "Refund Amount":
              rowData["Refund Amount"] = `${order?.total?.toFixed(2)}`;
              break;
            case "Order Status":
              rowData["Order Status"] = order?.orderStatus;
              break;
            case "Status":
              rowData["Status"] = order?.orderStatus;
              break;
            case "Email":
              rowData["Email"] = order?.customerInfo?.email;
              break;
            case "Phone Number":
              rowData["Phone Number"] = order?.customerInfo?.phoneNumber;
              break;
            case "Alt. Phone Number":
              rowData["Alt. Phone Number"] = order?.customerInfo?.phoneNumber2 || "--";
              break;
            case "Shipping Method":
              rowData["Shipping Method"] = order?.deliveryInfo?.deliveryMethod;
              break;
            case "Payment Status":
              rowData["Payment Status"] = order?.paymentInfo?.paymentStatus;
              break;
            case "Payment Method":
              rowData["Payment Method"] = order?.paymentInfo?.paymentMethod;
              break;
            default:
              break;
          }
        }
      });

      return rowData;
    });

    // Use jsPDF-AutoTable to create the table
    autoTable(doc, {
      columns: columns,  // Column headers
      body: rows,        // Order data
      startY: 10,        // Start position for the table
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },  // Center-align data
      headStyles: { halign: 'center', valign: 'middle' },           // Center-align headers
      theme: "striped",  // Optional: customize the look of the table
      columnStyles: {
        "Alt. Phone Number": { halign: 'center' }, // Center-align for "--" placeholder
      }
    });

    // Save the PDF document
    doc.save("Filtered_Orders.pdf");
  };

  const exportToXLS = async () => {
    let dataToExport = [];

    // Check if a search query is applied (i.e., if `searchedOrders` is not empty)
    if (searchQuery) {
      dataToExport = searchedOrders;
    }
    // If date range is applied, filter orders based on date range
    else if (startDate && adjustedEndDate) {
      dataToExport = filteredOrders.filter(order => {
        const orderDate = parseDate(order.dateTime);
        return orderDate >= startDate && orderDate <= adjustedEndDate;
      });
    }
    // Otherwise, apply tab-based filtering
    else {
      dataToExport = filteredOrders;
    }

    // Extract only the order-level details for the export
    const filteredData = dataToExport.map(row => {
      const data = {};

      // Include all selected columns, even if empty
      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case 'Order Number':
              data["Order Number"] = row?.orderNumber || "";  // Include empty cells
              break;
            case 'R. Order Number':
              data["R. Order Number"] = row?.orderNumber || "";  // Include empty cells
              break;
            case 'Date & Time':
              data["Date & Time"] = row?.dateTime || "";  // Include empty cells
              break;
            case 'Customer Name':
              data["Customer Name"] = row?.customerInfo?.customerName || "";  // Include empty cells
              break;
            case 'Order Amount':
              data["Order Amount"] = row?.total || "";  // Include empty cells
              break;
            case 'Refund Amount':
              data["Refund Amount"] = row?.total || "";  // Include empty cells
              break;
            case 'Order Status':
              data["Order Status"] = row?.orderStatus || "";  // Include empty cells
              break;
            case 'Status':
              data["Status"] = row?.orderStatus || "";  // Include empty cells
              break;
            case 'Email':
              data["Email"] = row?.customerInfo?.email || "";  // Include empty cells
              break;
            case 'Phone Number':
              data["Phone Number"] = row?.customerInfo?.phoneNumber || "";  // Include empty cells
              break;
            case 'Alt. Phone Number':
              data["Alt. Phone Number"] = row?.customerInfo?.phoneNumber2 || "";  // Include empty cells
              break;
            case 'Shipping Method':
              data["Shipping Method"] = row?.deliveryInfo?.deliveryMethod || "";  // Include empty cells
              break;
            case 'Payment Status':
              data["Payment Status"] = row?.paymentInfo?.paymentStatus || "";  // Include empty cells
              break;
            case 'Payment Method':
              data["Payment Method"] = row?.paymentInfo?.paymentMethod || "";  // Include empty cells
              break;
            default:
              break;
          }
        }
      });

      return data;
    });

    // Create the filename dynamically based on applied filters
    let fileName = 'order_data';
    if (searchQuery) fileName += `_searched`;
    else if (startDate && adjustedEndDate) fileName += `_from_${formatDate(startDate)}_to_${formatDate(adjustedEndDate)}`;
    else fileName += `_${selectedTab.replace(/\s/g, '_').toLowerCase()}`;

    // Prepare the worksheet and workbook for XLSX export
    const worksheet = XLSX.utils.json_to_sheet(filteredData);  // Convert JSON data to sheet format
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Export the file as XLSX
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleDownload = (imgUrl) => {
    if (!imgUrl) return;

    // Extract the image name from the URL
    const fileName = imgUrl.split("/").pop().split("?")[0]; // Removes any query parameters

    // Trigger the download with the extracted filename
    saveAs(imgUrl, fileName);
  };

  const matchingShipmentHandlers = useMemo(() => {
    if (!shippingList || !orderToUpdate?.deliveryInfo?.city) return [];

    return shippingList?.filter(zone => zone?.selectedCity?.includes(orderToUpdate?.deliveryInfo?.city))?.map(zone => zone?.selectedShipmentHandler).filter(Boolean) || []; // Ensure no null or undefined values

  }, [shippingList, orderToUpdate?.deliveryInfo?.city]);

  useEffect(() => {
    if (paginatedOrders?.length === 0) {
      setPage(0); // Reset to the first page if no data
    }
  }, [paginatedOrders]);

  if (isOrderListPending || isShippingPending || isUserLoading) {
    return <Loading />;
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
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='max-w-screen-2xl px-3 md:px-6 mx-auto'>

        <div className='flex items-center justify-between py-2 md:py-5 gap-2'>

          <div className='w-full'>
            <h3 className='text-center md:text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>ORDER MANAGEMENT</h3>
          </div>

          {/* Search Product Item */}
          <div className='w-full'>
            <li className="flex items-center relative group">
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

        </div>

        <div className='pb-3 px-6 md:px-0 pt-3 md:pt-0 flex flex-wrap lg:flex-nowrap gap-3 lg:gap-0 justify-center md:justify-between'>
          <div className='flex justify-center md:justify-start w-full'>
            <TabsOrder
              tabs={tabsWithCounts}
              selectedTab={`${selectedTab} (${counts[selectedTab] || 0})`} // Pass the selected tab with the count
              onTabChange={(tab) => setSelectedTab(tab.split(' (')[0])} // Extract the tab name without the count
            />
          </div>

          <div className='flex w-full items-center max-w-screen-2xl px-3 mx-auto justify-center md:justify-end gap-3 md:gap-6'>

            <div ref={dropdownRefDownload} className="relative inline-block text-left z-10">
              <button onClick={() => toggleDropdown('download')} className="relative z-[1] flex items-center gap-x-1.5 rounded-lg bg-[#d4ffce] px-3 md:px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[10px] md:text-[14px] text-neutral-700">
                EXPORT AS
                <svg
                  className={`h-5 w-5 transform transition-transform duration-300 ${openDropdown === "download" ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'download' && (
                <div className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2 flex flex-col gap-2">

                    {/* Button to export to CSV */}
                    <button
                      onClick={exportToCSV}
                      className="mx-2 relative w-[150px] h-[40px] cursor-pointer text-xs flex items-center border border-[#d4ffce] bg-[#d4ffce] overflow-hidden transition-all hover:bg-[#bdf6b4] active:border-[#d4ffce] group rounded-lg
                md:w-[140px] md:h-[38px] lg:w-[150px] lg:h-[40px] sm:w-[130px] sm:h-[36px]">
                      <span className="relative translate-x-[26px] text-neutral-700 font-semibold transition-transform duration-300 group-hover:text-transparent text-xs
                md:translate-x-[24px] lg:translate-x-[26px] sm:translate-x-[22px]">
                        EXPORT CSV
                      </span>
                      <span className="absolute transform translate-x-[109px] h-full w-[39px] bg-[#bdf6b4] flex items-center justify-center transition-transform duration-300 group-hover:w-[148px] group-hover:translate-x-0 active:bg-[#d4ffce]
                md:translate-x-[100px] lg:translate-x-[109px] sm:translate-x-[90px]">
                        <HiOutlineDownload size={20} className='text-neutral-700' />
                      </span>
                    </button>

                    {/* Button to export to XLSX */}
                    <button
                      onClick={exportToXLS}
                      className="mx-2 relative w-[150px] h-[40px] cursor-pointer text-xs flex items-center border border-[#d4ffce] bg-[#d4ffce] overflow-hidden transition-all hover:bg-[#bdf6b4] active:border-[#d4ffce] group rounded-lg
                md:w-[140px] md:h-[38px] lg:w-[150px] lg:h-[40px] sm:w-[130px] sm:h-[36px]">
                      <span className="relative translate-x-[26px] text-neutral-700 font-semibold transition-transform duration-300 group-hover:text-transparent text-xs
                md:translate-x-[24px] lg:translate-x-[26px] sm:translate-x-[22px]">
                        EXPORT XLSX
                      </span>
                      <span className="absolute transform translate-x-[109px] h-full w-[39px] bg-[#bdf6b4] flex items-center justify-center transition-transform duration-300 group-hover:w-[148px] group-hover:translate-x-0 active:bg-[#d4ffce]
                md:translate-x-[100px] lg:translate-x-[109px] sm:translate-x-[90px]">
                        <HiOutlineDownload size={20} className='text-neutral-700' />
                      </span>
                    </button>

                    <button
                      onClick={exportToPDF}
                      className="mx-2 relative w-[150px] h-[40px] cursor-pointer text-xs flex items-center border border-[#d4ffce] bg-[#d4ffce] overflow-hidden transition-all hover:bg-[#bdf6b4] active:border-[#d4ffce] group rounded-lg
                md:w-[140px] md:h-[38px] lg:w-[150px] lg:h-[40px] sm:w-[130px] sm:h-[36px]">
                      <span className="relative translate-x-[26px] text-neutral-700 font-semibold transition-transform duration-300 group-hover:text-transparent text-xs
                md:translate-x-[24px] lg:translate-x-[26px] sm:translate-x-[22px]">
                        EXPORT PDF
                      </span>
                      <span className="absolute transform translate-x-[109px] h-full w-[39px] bg-[#bdf6b4] flex items-center justify-center transition-transform duration-300 group-hover:w-[148px] group-hover:translate-x-0 active:bg-[#d4ffce]
                md:translate-x-[100px] lg:translate-x-[109px] sm:translate-x-[90px]">
                        <HiOutlineDownload size={20} className='text-neutral-700' />
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>

            <div ref={dropdownRef} className="relative inline-block text-left z-10">

              <button onClick={() => toggleDropdown2('other')} className="relative z-[1] flex items-center gap-x-1.5 rounded-lg bg-[#ffddc2] p-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[10px] md:text-[14px] text-neutral-700">
                CUSTOMIZE
                <svg
                  className={`h-5 w-5 transform transition-transform duration-300 ${openDropdown2 === "other" ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown2 === 'other' && (
                <div className="absolute right-0 z-10 mt-2 w-64 md:w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                  <div className="p-1">

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
                    <button className="relative z-[1] flex items-center justify-center gap-x-3 rounded-lg bg-[#ffddc2] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[14px] text-neutral-700 w-full" onClick={() => { setColumnModalOpen(true); setOpenDropdown(false) }}>
                      Choose Columns <TbColumnInsertRight size={20} />
                    </button>

                  </div>
                </div>
              )}

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
        <div className="max-w-screen-2xl mx-auto custom-max-h-orders overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                {columnOrder?.map((column) => selectedColumns.includes(column) && (
                  <th key={column} className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">{column}</th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders?.length === 0 ? (
                <tr>
                  <td colSpan={selectedColumns.length} className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-[310px]">
                    No orders found matching your criteria. Please adjust your filters or check back later.
                  </td>
                </tr>
              ) : (
                paginatedOrders?.map((order, index) => (
                  <tr key={order?._id || index} className="hover:bg-gray-50 transition-colors">
                    {columnOrder.map(
                      (column) =>
                        selectedColumns.includes(column) && (
                          <React.Fragment key={`${order?._id || index}-${column}`}>
                            {column === 'Order Number' && (
                              <td key="orderNumber" className={`text-xs p-3 font-mono ${isAuthorized ? "cursor-pointer text-blue-600 hover:text-blue-800" : "text-neutral-800"}`} onClick={isAuthorized ? () => handleOrderClick(order) : undefined}>
                                {order?.orderNumber}
                              </td>
                            )}
                            {column === 'R. Order Number' && (
                              <td key="returnNumber" className={`text-xs p-3 font-mono ${isAuthorized ? "cursor-pointer text-blue-600 hover:text-blue-800" : "text-neutral-800"}`} onClick={isAuthorized ? () => handleOrderClick(order) : undefined}>
                                {order?.orderNumber}
                              </td>
                            )}
                            {column === 'Date & Time' && (
                              <td key="dateTime" className="text-xs p-3 text-gray-700 text-center">{order?.dateTime}</td>
                            )}
                            {column === 'Customer Name' && (
                              <td key="customerName" className="text-xs p-3 text-gray-700 uppercase text-center">{order?.customerInfo?.customerName}</td>
                            )}
                            {column === 'Order Amount' && (
                              <td key="orderAmount" className="text-xs p-3 text-gray-700 text-right">৳ {order?.total?.toFixed(2)}</td>
                            )}
                            {column === 'Refund Amount' && (
                              <td key="refundAmount" className="text-xs p-3 text-gray-700 text-right">৳ {order?.returnInfo?.refundAmount?.toFixed(2)}</td>
                            )}
                            {column === 'Order Status' && (
                              <td key="orderStatus" className="text-xs p-3 text-yellow-600 text-center">{order?.orderStatus}</td>
                            )}
                            {column === 'Status' && (
                              <td key="status" className="text-xs p-3 text-yellow-600 text-center">{order?.orderStatus}</td>
                            )}
                            {column === 'Action' && (
                              <td className="p-3">
                                <div className="flex gap-2 items-center">

                                  {order.orderStatus === 'Pending' && (
                                    <Button isDisabled={!isAuthorized} onPress={() => handleActions(order._id)} size="sm" className="text-xs w-20" color="primary" variant="flat">
                                      Confirm
                                    </Button>
                                  )}

                                  {order.orderStatus === 'Processing' && (
                                    <Button isDisabled={!isAuthorized} onPress={() => handleActions(order._id, 'shipped')} size="sm" className="text-xs w-20" color="secondary" variant="flat">
                                      Shipped
                                    </Button>
                                  )}

                                  {order.orderStatus === 'Shipped' && (
                                    <div className="flex items-center gap-2">

                                      <Button isDisabled={!isAuthorized} className="text-xs w-20" onPress={() => handleActions(order._id, 'onHold')} size="sm" color="warning" variant="flat">
                                        On Hold
                                      </Button>

                                      <Button isDisabled={!isAuthorized} className="text-xs w-20" onPress={() => handleActions(order._id, 'delivered')} size="sm" color="success" variant="flat">
                                        Delivered
                                      </Button>
                                    </div>
                                  )}

                                  {order.orderStatus === 'On Hold' && (
                                    <Button isDisabled={!isAuthorized} className="text-xs w-20" onPress={() => handleActions(order._id, 'delivered')} size="sm" color="success" variant="flat">
                                      Delivered
                                    </Button>
                                  )}

                                  {order.orderStatus === 'Delivered' && (
                                    <Button
                                      className="text-xs w-20"
                                      size="sm"
                                      isDisabled
                                    >
                                      Completed
                                    </Button>
                                  )}

                                  {order.orderStatus === 'Return Requested' && (
                                    <div className="flex items-center gap-2">
                                      <Button className="text-xs w-20" onPress={() => handleActions(order._id, 'approved')} color='success' isDisabled={!isAuthorized} size="sm" variant="flat">
                                        Approve
                                      </Button>
                                      <Button isDisabled={!isAuthorized} className="text-xs w-20" onPress={() => handleActions(order._id, 'declined')} size="sm" color="danger" variant="flat">
                                        Decline
                                      </Button>
                                    </div>
                                  )}

                                  {order.orderStatus === 'Request Accepted' && (
                                    <div className="flex items-center gap-2">
                                      <Button className="text-xs w-20" onPress={() => handleActions(order._id, 'returned')} size="sm" color="secondary"
                                        isDisabled={!isAuthorized}
                                        variant="flat">
                                        Return
                                      </Button>
                                    </div>
                                  )}

                                  {order.orderStatus === 'Request Declined' && (
                                    <div className="flex items-center gap-2">
                                      <Button className="text-xs w-20"
                                        isDisabled size="sm"
                                        color="default">
                                        Declined
                                      </Button>
                                    </div>
                                  )}

                                  {order.orderStatus === 'Return Initiated' && (
                                    <Button
                                      className="text-xs w-20"
                                      size="sm"
                                      color="warning"
                                      variant='flat'
                                      onPress={() => handleActions(order._id, 'refunded')}
                                      isDisabled={!isAuthorized}
                                    >
                                      Refund
                                    </Button>
                                  )}

                                  {order.orderStatus === 'Refunded' && (
                                    <Button
                                      className="text-xs w-20"
                                      size="sm"
                                      color="default"
                                      isDisabled
                                    >
                                      Refunded
                                    </Button>
                                  )}

                                  {/* Undo button logic */}
                                  {isOwner ? (
                                    checkUndoAvailability(order) && (
                                      <button
                                        onClick={() => handleActions(order._id, '', true)}
                                        className="text-red-600 hover:text-red-800 focus:ring-2 focus:ring-red-500 rounded p-1"
                                      >
                                        <FaUndo />
                                      </button>
                                    )
                                  ) : (
                                    <></>
                                  )}

                                </div>
                              </td>
                            )}
                            {column === 'Email' && (
                              <td key="email" className="text-xs p-3 text-gray-700">{order?.customerInfo?.email}</td>
                            )}
                            {column === 'Phone Number' && (
                              <td key="phoneNumber" className="text-xs p-3 text-gray-700 text-center">{order?.customerInfo?.phoneNumber}</td>
                            )}
                            {column === 'Alt. Phone Number' && (
                              <td key="altPhoneNumber" className="text-xs p-3 text-gray-700 text-center">{order?.customerInfo?.phoneNumber2 === "" ? '--' : order?.customerInfo?.phoneNumber2}</td>
                            )}
                            {column === 'Shipping Method' && (
                              <td key="shippingMethod" className="text-xs p-3 text-gray-700 text-center">{order?.deliveryInfo?.deliveryMethod}</td>
                            )}
                            {column === 'Payment Status' && (
                              <td key="paymentStatus" className="text-xs p-3 text-gray-700 text-center">{order?.paymentInfo?.paymentStatus}</td>
                            )}
                            {column === 'Payment Method' && (
                              <td key="paymentMethod" className="text-xs p-3 text-gray-700 text-center">{order?.paymentInfo?.paymentMethod}</td>
                            )}
                          </React.Fragment>
                        )
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal of order number */}
        {selectedOrder && (
          <Modal className='mx-4 lg:mx-0' isOpen={isOpen} onOpenChange={onClose} size='xl'>
            <ModalContent>
              <div className='flex items-center justify-center'>
                <ModalHeader className="text-sm md:text-base"><Barcode selectedOrder={selectedOrder} /></ModalHeader>
              </div>
              <ModalBody className="modal-body-scroll">

                <Accordion defaultExpandedKeys={["1"]}>

                  <AccordionItem
                    key="1"
                    aria-label="Order Information"
                    title={<strong>Order Information</strong>}
                  >
                    <div className='flex justify-between mb-3'>
                      <div className='flex flex-col gap-2.5 w-full'>
                        <p>Order Id - <strong>#{selectedOrder?.orderNumber}</strong></p>
                        <p className='text-xs md:text-base'>Payment Method: {selectedOrder?.paymentInfo?.paymentMethod}</p>
                        <p className='text-xs md:text-base'>Trans. Id: {selectedOrder?.paymentInfo?.transactionId}</p>
                      </div>
                      <div className='flex flex-col gap-2.5 w-full'>
                        <p>Customer Id - <strong>{selectedOrder?.customerInfo?.customerId}</strong></p>
                        <p>Customer Name - <strong>{selectedOrder?.customerInfo?.customerName}</strong></p>
                        <p className='text-xs md:text-base'>Address: {selectedOrder?.deliveryInfo?.address1} {selectedOrder?.deliveryInfo?.address2}, {selectedOrder?.deliveryInfo?.city}, {selectedOrder?.deliveryInfo?.postalCode}</p>
                        {selectedOrder?.deliveryInfo?.noteToSeller && <p className='text-xs md:text-base'>Customer Note: <strong>{selectedOrder?.deliveryInfo?.noteToSeller}</strong></p>}
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    key="3"
                    aria-label="Product Information"
                    title={<strong>Product Information</strong>}
                  >
                    {/* Display product and promo/offer information */}
                    <div className='flex justify-between gap-6'>
                      <div>
                        {selectedOrder.productInformation && selectedOrder.productInformation.length > 0 && (
                          <>
                            {selectedOrder.productInformation.map((product, index) => (
                              <div key={index} className="mb-4">
                                <p><strong>Product : </strong> {product?.productTitle}</p>
                                <p><strong>Product ID : </strong> {product?.productId}</p>
                                <p><strong>Size:</strong>  {product?.size}</p>
                                <p className='flex items-center gap-2'><strong>Color:</strong>
                                  {product?.color?.label}
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      width: '20px',
                                      height: '20px',
                                      backgroundColor: product.color?.color || '#fff',
                                      marginRight: '8px',
                                      borderRadius: '4px'
                                    }}
                                  />
                                </p>
                                <p><strong>Batch Code:</strong> {product?.batchCode}</p>
                                <p><strong>Unit Price:</strong> ৳ {product?.discountInfo ? product?.discountInfo?.finalPriceAfterDiscount : product?.regularPrice}</p>
                                {product.offerInfo && (
                                  <div className="flex items-center">
                                    <strong>Offer Price:</strong> ৳{" "}
                                    <p>
                                      {(product?.regularPrice - (product?.offerInfo?.appliedOfferDiscount / product?.sku)).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                {/* Is Promo Price is needed to show on backend? */}
                                {/* {product.promoInfo && (
                            <p>
                              <strong>Promo Price:</strong> ৳{" "}
                              -- Logic will be here --
                            </p>
                          )} */}
                                <p><strong>SKU:</strong> {product?.sku}</p>
                                <div className='flex gap-0.5'><strong>Vendors:</strong>{product?.vendors?.length > 0 ? product?.vendors?.map((vendor, index) => (
                                  <p key={index}>{vendor}</p>
                                )) : "--"}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      <div className='flex flex-col items-center text-sm md:text-base w-60'>
                        <p className='w-full'><strong>Sub Total:</strong>  ৳ {selectedOrder?.subtotal?.toFixed(2)}</p>
                        <div className='w-full'>
                          {selectedOrder?.totalSpecialOfferDiscount > 0 ? (
                            <span> <strong>Offer Discount:</strong> ৳{selectedOrder?.totalSpecialOfferDiscount}</span>
                          ) : selectedOrder?.promoInfo ? (
                            <span> <strong>Promo Discount:</strong> ৳{selectedOrder?.promoInfo.appliedPromoDiscount}</span>
                          ) : (
                            <p>
                              <strong> Promo/Offer applied: </strong><span>X</span>
                            </p>
                          )}
                        </div>
                        <p className='w-full'><strong>Shipping Charge:</strong>  ৳ {selectedOrder?.shippingCharge}</p>
                        <p className='w-full'><strong>Total Amount:</strong>  ৳ {selectedOrder?.total?.toFixed(2)}</p>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    key="2"
                    aria-label="Shipment Information"
                    title={<strong>Shipment Information</strong>}
                  >
                    <div className='mb-3 flex flex-col gap-2'>
                      <div className='flex justify-between items-center'>
                        <p className='text-xs md:text-base'>Shipment Handler: {selectedOrder?.shipmentInfo?.selectedShipmentHandlerName === undefined ? '--' : selectedOrder?.shipmentInfo?.selectedShipmentHandlerName}</p>
                        <p className='text-xs md:text-base'>Tracking Number: {selectedOrder?.shipmentInfo?.trackingNumber ? selectedOrder?.shipmentInfo?.trackingNumber : "--"}</p>
                      </div>
                      {selectedOrder?.onHoldReason && <p className='text-xs md:text-base'>On Hold reason: <strong>{selectedOrder?.onHoldReason}</strong></p>}
                    </div>
                  </AccordionItem>

                  {selectedOrder?.returnInfo && <AccordionItem key="4"
                    aria-label="Return Information"
                    title={<strong>Return Information</strong>}>

                    <div className='flex flex-col gap-4'>

                      <div>
                        {["Request Accepted", "Return Initiated", "Refunded"].includes(selectedOrder?.orderStatus) && (
                          <p className="text-green-500 text-lg font-bold pb-2.5">Approved</p>
                        )}

                        {selectedOrder?.declinedReason && selectedOrder?.orderStatus === "Request Declined" &&
                          (
                            <div>
                              <p className="text-red-500 text-lg font-bold">Declined</p>
                              <p className="pb-4">
                                <strong>Declined Reason:</strong> <i>{selectedOrder?.declinedReason}</i>
                              </p>
                            </div>
                          )}
                        <p><strong>Return Date & Time :</strong> {selectedOrder?.returnInfo?.dateTime}</p>
                        <p><strong>Return Reason :</strong> {selectedOrder?.returnInfo?.reason}</p>
                        {selectedOrder?.returnInfo?.description && <p><strong>Description :</strong> <i>{selectedOrder?.returnInfo?.description}</i></p>}
                      </div>

                      <div>
                        <p className='font-bold text-lg'>Returned Product Details</p>
                        {selectedOrder?.returnInfo?.products?.map((product, index) => (
                          <div key={index} className="mb-4">
                            <p><strong>Product : </strong> {product?.productTitle}</p>
                            <p><strong>Product ID : </strong> {product?.productId}</p>
                            <p><strong>Size:</strong>  {product?.size}</p>
                            <p className='flex items-center gap-2'><strong>Color:</strong>
                              {product?.color?.label}
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: product.color?.color || '#fff',
                                  marginRight: '8px',
                                  borderRadius: '4px'
                                }}
                              />
                            </p>
                            <p><strong>Unit Price:</strong> ৳ {product?.finalUnitPrice}</p>
                            <p><strong>SKU:</strong> {product?.sku}</p>
                          </div>
                        ))}
                      </div>

                    </div>

                  </AccordionItem>}

                  {selectedOrder?.returnInfo && <AccordionItem key="5"
                    aria-label="Attachments"
                    title={<strong>Attachments</strong>}>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedOrder?.returnInfo?.imgUrls?.map((imgUrl, index) => (
                        <div key={index} className="relative group h-24 w-full">
                          {/* Display the image */}
                          <Image
                            src={imgUrl}
                            alt={`Product Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                            height={2000}
                            width={2000}
                          />

                          {/* Button Wrapper (Centers Both Buttons) */}
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition">
                            {/* Expand Icon */}
                            <button
                              onClick={() => {
                                setActiveImageIndex(index);
                                setIsImageExpanded(true);
                              }}
                              className="text-white bg-black bg-opacity-50 p-2 rounded-full"
                            >
                              <CgArrowsExpandRight size={24} />
                            </button>

                            {/* Download Icon */}
                            <button
                              onClick={() => handleDownload(imgUrl)}
                              className="text-white bg-black bg-opacity-50 p-2 rounded-full"
                            >
                              <HiDownload size={24} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>


                  </AccordionItem >}

                </Accordion>

                {/* Modal */}
                {isImageExpanded && (
                  <ProductExpandedImageModalOrder
                    productTitle={
                      selectedOrder?.returnInfo?.products?.[activeImageIndex]?.productTitle
                    }
                    selectedColorLabel={
                      selectedOrder?.returnInfo?.products?.[activeImageIndex]?.color?.label
                    }
                    expandedImgUrl={
                      selectedOrder?.returnInfo?.imgUrls?.[activeImageIndex]
                    }
                    totalImages={selectedOrder?.returnInfo?.imgUrls?.length}
                    activeImageIndex={activeImageIndex}
                    setActiveImageIndex={setActiveImageIndex}
                    isImageExpanded={isImageExpanded}
                    setIsImageExpanded={setIsImageExpanded}
                  />
                )}

              </ModalBody>

              <ModalFooter className={`flex items-center ${selectedOrder?.lastStatusChange ? "justify-between" : "justify-end"} `}>

                {
                  selectedOrder?.lastStatusChange ? (
                    <i>
                      Last updated on{" "}
                      {(() => {
                        const rawDate = selectedOrder.lastStatusChange;
                        const date = new Date(rawDate);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = String(date.getFullYear()).slice(-2);
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}-${month}-${year} | ${hours}:${minutes}`;
                      })()}
                    </i>
                  ) : (
                    ""
                  )
                }

                {!isImageExpanded && <PrintButton selectedOrder={selectedOrder} />}

              </ModalFooter>

            </ModalContent>
          </Modal>
        )}

        {/* Modal of selecting shipment handler & tracking number */}
        {matchingShipmentHandlers?.length > 0 && (
          <Modal size='lg' isOpen={isTrackingModalOpen} onOpenChange={(isOpen) => {
            setTrackingModalOpen(isOpen);
            if (!isOpen) {
              // Reset state when modal closes
              setTrackingNumber('');
              setSelectedHandler(null);
            }
          }}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1 bg-gray-200">Select Shipment Handler</ModalHeader>
              <ModalBody className='p-4'>
                <div className='flex flex-wrap items-center justify-center gap-2'>
                  {matchingShipmentHandlers?.map((handler, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 border-2 rounded-lg font-semibold px-6 py-2 cursor-pointer ${selectedHandler?.shipmentHandlerName === handler?.shipmentHandlerName ? 'border-[#ffddc2] bg-[#ffddc2]' : 'bg-white'
                        }`}
                      onClick={() => handleSelectHandler(handler)}
                    >
                      {handler?.shipmentHandlerName}
                    </div>
                  ))}
                </div>

                <div className='flex justify-between items-center gap-2'>
                  <Input
                    clearable
                    bordered
                    fullWidth
                    size="lg"
                    label="Tracking Number *"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  />
                </div>

              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={async () => {
                    // Check if handler is selected, regardless of toggle state
                    if (!selectedHandler) {
                      toast.error("Please select a shipment handler.");
                      return; // Stop execution if no handler is selected
                    }

                    // When toggle is ON, ensure tracking number is entered
                    if (!trackingNumber) {
                      toast.error("Please enter a tracking number.");
                      return; // Stop execution if no tracking number is provided
                    }

                    // Update order status with tracking number and selected handler
                    try {
                      await updateOrderStatus(orderToUpdate, orderIdToUpdate, "shipped", false, trackingNumber, selectedHandler);
                      setTrackingModalOpen(false); // Close modal after submission
                      setTrackingNumber(''); // Clear input field
                      setSelectedHandler(null); // Clear the selected handler
                    } catch (error) {
                      console.error("Failed to updated order status:", error)
                      toast.error("Something went wrong while updating the order status.")
                    }
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Modal of on hold */}
        <Modal size='lg' isOpen={isOnHoldModalOpen} onOpenChange={(isOpen) => {
          setOnHoldModalOpen(isOpen);
          if (!isOpen) {
            // Reset state when modal closes
            setOnHoldModalOpen(false);
            setOnHoldReason('');
          }
        }}>
          <ModalContent className='px-2'>
            <ModalHeader className="flex flex-col gap-1">On Hold Reason</ModalHeader>
            <ModalBody>

              <div className='flex justify-between items-center gap-2'>
                <Input
                  clearable
                  bordered
                  fullWidth
                  size="lg"
                  label="On Hold Reason *"
                  placeholder="Enter on hold reason"
                  value={onHoldReason}
                  onChange={(e) => setOnHoldReason(e.target.value)}
                />
              </div>

            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={async () => {

                  // When toggle is ON, ensure tracking number is entered
                  if (!onHoldReason) {
                    toast.error("Please enter on hold reason.");
                    return; // Stop execution if no tracking number is provided
                  }

                  // Update order status with tracking number and selected handler
                  await updateOrderStatus(orderToUpdateOnHold, orderIdToUpdateOnHold, "onHold", false, onHoldReason);
                  setOnHoldModalOpen(false); // Close modal after submission
                  setOnHoldReason(''); // Clear input field
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal of Declined reason */}
        <Modal size='lg' isOpen={isDeclinedModalOpen} onOpenChange={(isOpen) => {
          setDeclinedModalOpen(isOpen)
          if (!isOpen) {
            setDeclinedModalOpen(false);
            setDeclinedReason('');
          }
        }}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 bg-gray-200 px-8">Provide a Reason for Declining the Order</ModalHeader>
            <ModalBody>

              <div className='flex justify-between items-center gap-2 my-2'>
                <Textarea
                  clearable
                  disableAnimation
                  variant="underlined"
                  fullWidth
                  size="lg"
                  placeholder="Enter declined reason"
                  value={declinedReason}
                  onChange={(e) => setDeclinedReason(e.target.value)}
                />
              </div>

            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                size='sm'
                onPress={async () => {

                  // When toggle is ON, ensure tracking number is entered
                  if (!declinedReason) {
                    toast.error("Please enter declined reason.");
                    return; // Stop execution if no tracking number is provided
                  }

                  // Update order status with tracking number and selected handler
                  await updateOrderStatus(orderToUpdateDeclined, orderIdToUpdateDeclined, "declined", false, declinedReason);
                  setDeclinedModalOpen(false); // Close modal after submission
                  setDeclinedReason(''); // Clear input field
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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

export default OrderContents;