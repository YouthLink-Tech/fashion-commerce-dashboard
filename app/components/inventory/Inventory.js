"use client";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import useProductsInformation from '@/app/hooks/useProductsInformation';
import Loading from '@/app/components/shared/Loading/Loading';
import Image from 'next/image';

import useOrders from '@/app/hooks/useOrders';
import useLocations from '@/app/hooks/useLocations';
import { HiOutlineDownload } from 'react-icons/hi';

import { IoCheckmarkOutline } from "react-icons/io5";
import { useSearchParams } from 'next/navigation';
import CustomPagination from '../shared/pagination/CustomPagination';
import PaginationSelect from '../shared/pagination/PaginationSelect';
import LocationDropdown from '../product/dropdown/LocationDropdown';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { BiTransferAlt, BiMinusCircle } from "react-icons/bi";
import toast from 'react-hot-toast';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/auth';
import Swal from 'sweetalert2';

const currentModule = "Product Hub";

const Inventory = () => {

  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpen2, onOpenChange: onOpenChange2 } = useDisclosure();
  const axiosSecure = useAxiosSecure();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [productList, isProductPending, refetch] = useProductsInformation();
  const [orderList, isOrderPending, refetchOrder] = useOrders();
  const [locationList, isLocationPending] = useLocations();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isOpenDropdown2, setIsOpenDropdown2] = useState(false);
  const [locationNameForMessage, setLocationNameForMessage] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [selectedReturnInfos, setSelectedReturnInfos] = useState([]);
  const [selectedForfeitedInfos, setSelectedForfeitedInfos] = useState([]);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isOwner = role === "Owner";

  useEffect(() => {
    if (searchQuery) {
      refetch();  // RefetchOrders when search query changes
    }
  }, [searchQuery, refetch]);

  useEffect(() => {
    if (productId) {
      setSearchQuery(productId);
    }
  }, [productId]);

  useEffect(() => {
    // Re-filter and update filtered products whenever productList or orderList changes
    const filteredVariants = productList?.flatMap((product) =>
      product.productVariants
        ?.filter((variant) => variant?.location === locationNameForMessage)
        .map((variant) => ({
          productTitle: product?.productTitle,
          size: variant?.size,
          color: variant?.color.label, // Display color label
          colorCode: variant?.color.color, // Display color code for visualization
          sku: variant?.sku,
          returnSku: variant?.returnSku,
          forfeitedSku: variant?.forfeitedSku,
          onHandSku: variant?.onHandSku,
          imageUrl: variant?.imageUrls[0], // Assuming we want the first image
          productId: product?.productId,
        }))
    );
    setFilteredProducts(filteredVariants);
  }, [productList, orderList, locationNameForMessage]);  // Dependencies trigger re-filtering  

  const handleLocationSelect = (locationName) => {
    // Set location message to notify the user of the selected inventory location
    setLocationNameForMessage(locationName);

    // Step 1: Filter product variants by the selected location
    const filteredVariants = productList?.flatMap((product) =>
      product.productVariants
        ?.filter((variant) => variant?.location === locationName)
        .map((variant) => ({
          productTitle: product?.productTitle,
          size: variant?.size,
          color: variant?.color.label, // Display color label
          colorCode: variant?.color.color, // Display color code for visualization
          sku: variant?.sku,
          onHandSku: variant?.onHandSku,
          returnSku: variant?.returnSku,
          forfeitedSku: variant?.forfeitedSku,
          imageUrl: variant?.imageUrls[0], // Assuming we want the first image
          productId: product?.productId,
        }))
    );

    // Step 2: Set the filtered products with unique combinations of size and color
    setFilteredProducts(filteredVariants);
  };

  // Filter products based on search query
  const searchedProducts = filteredProducts?.filter(product => {
    const query = searchQuery.toLowerCase();
    const isNumberQuery = !isNaN(query) && query.trim() !== '';

    // Check if any product detail contains the search query
    const productTitle = (product?.productTitle || '').toLowerCase();
    const productId = (product?.productId || '').toLowerCase();
    const size = (product?.size !== undefined && product?.size !== null) ? product?.size?.toString().toLowerCase() : ''; // Convert size to string
    const color = (product?.color || '').toLowerCase();
    const sku = (product?.sku || '').toString();
    const onHandSku = (product?.onHandSku || '').toString();

    // Check for matches
    const matchesSearch = (
      productTitle?.includes(query) ||
      productId?.includes(query) ||
      size?.includes(query) ||
      color?.includes(query) ||
      (isNumberQuery && sku === query) || // Numeric comparison for SKU 
      (isNumberQuery && onHandSku === query) // Numeric comparison for SKU
    );

    const isLowStock = showLowStock && product?.sku >= 1 && product.sku <= 9;
    const isOutOfStock = showOutOfStock && product.sku === 0;

    // If any stock filter is active, include both stock and search criteria
    if (showLowStock || showOutOfStock) {
      return (isLowStock || isOutOfStock) && matchesSearch;
    }

    // If no stock filter, apply only search
    return matchesSearch;

  });

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setPage(0); // Reset to first page when changing items per page
  };

  const paginatedProducts = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchedProducts?.slice(startIndex, endIndex);
  }, [searchedProducts, page, itemsPerPage]);

  const totalPages = Math.ceil(searchedProducts?.length / itemsPerPage);

  const toggleDropdown = () => setIsOpenDropdown(!isOpenDropdown);
  const toggleDropdown2 = () => setIsOpenDropdown2(!isOpenDropdown2);

  // Find the primary location
  const primaryLocation = locationList?.find(location => location.isPrimaryLocation)?.locationName;

  // Check if the primary location matches the selected location
  const isMatchingLocation = primaryLocation === locationNameForMessage;

  // Export to CSV
  const exportToCSV = () => {
    const filteredData = paginatedProducts?.map(product => {
      let onPending = 0;
      let onProcess = 0;

      // Calculate "Pending" and "On Process"
      orderList?.forEach(order => {
        order?.productInformation.forEach(orderProduct => {
          const isMatchingProduct =
            product?.productId === orderProduct?.productId &&
            product?.size === orderProduct?.size &&
            product?.colorCode === orderProduct.color?.color;

          if (isMatchingProduct) {
            if (order?.orderStatus === "Pending") {
              onPending += orderProduct?.sku;
            } else if (order?.orderStatus === "Processing") {
              onProcess += orderProduct?.sku;
            }
          }
        });
      });

      return {
        productName: product.productTitle,
        size: product.size,
        color: product.color,
        pending: isMatchingLocation ? onPending : 0,
        onProcess: isMatchingLocation ? onProcess : 0,
        available: product.sku,
        onHand: product.onHandSku,
        returnSku: product.returnSku,
        forfeitedSku: product.forfeitedSku,
      };
    });

    const fileName = "products_data";
    const csv = Papa.unparse(filteredData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF("landscape");

    const columns = [
      { header: "Product Name", dataKey: "productName" },
      { header: "Size", dataKey: "size" },
      { header: "Color", dataKey: "color" },
      { header: "Pending", dataKey: "pending" },
      { header: "On Process", dataKey: "onProcess" },
      { header: "Available", dataKey: "available" },
      { header: "On Hand", dataKey: "onHand" },
      { header: "Return SKU", dataKey: "returnSku" },
      { header: "Forfeited SKU", dataKey: "forfeitedSku" },
    ];

    const rows = paginatedProducts.map(product => {
      let onPending = 0;
      let onProcess = 0;

      // Calculate "Pending" and "On Process"
      orderList?.forEach(order => {
        order?.productInformation.forEach(orderProduct => {
          const isMatchingProduct =
            product?.productId === orderProduct?.productId &&
            product?.size === orderProduct?.size &&
            product?.colorCode === orderProduct.color?.color;

          if (isMatchingProduct) {
            if (order?.orderStatus === "Pending") {
              onPending += orderProduct?.sku;
            } else if (order?.orderStatus === "Processing") {
              onProcess += orderProduct?.sku;
            }
          }
        });
      });

      return {
        productName: product.productTitle,
        size: product.size,
        color: product.color,
        pending: isMatchingLocation ? onPending : 0,
        onProcess: isMatchingLocation ? onProcess : 0,
        available: product.sku,
        onHand: product.onHandSku,
        returnSku: product.returnSku,
        forfeitedSku: product.forfeitedSku,
      };
    });

    autoTable(doc, {
      columns,
      body: rows,
      startY: 10,
      styles: { fontSize: 8, halign: "center", valign: "middle" },
      headStyles: { fillColor: [22, 160, 133] },
      theme: "striped",
    });

    doc.save("products_data.pdf");
  };

  // export to XLSX
  const exportToXLS = () => {
    const filteredData = paginatedProducts.map(product => {
      let onPending = 0;
      let onProcess = 0;

      // Calculate "Pending" and "On Process"
      orderList?.forEach(order => {
        order?.productInformation.forEach(orderProduct => {
          const isMatchingProduct =
            product?.productId === orderProduct?.productId &&
            product?.size === orderProduct?.size &&
            product?.colorCode === orderProduct.color?.color;

          if (isMatchingProduct) {
            if (order?.orderStatus === "Pending") {
              onPending += orderProduct?.sku;
            } else if (order?.orderStatus === "Processing") {
              onProcess += orderProduct?.sku;
            }
          }
        });
      });

      return {
        productName: product.productTitle,
        size: product.size,
        color: product.color,
        pending: isMatchingLocation ? onPending : 0,
        onProcess: isMatchingLocation ? onProcess : 0,
        available: product.sku,
        onHand: product.onHandSku,
        returnSku: product.returnSku,
        forfeitedSku: product.forfeitedSku,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, "products_data.xlsx");
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpenDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside2 = (event) => {
    if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
      setIsOpenDropdown2(false);
    }
  };

  // Function to toggle low stock products (SKU ≤ 10 and > 0)
  const handleShowLowStockProducts = () => {
    setShowLowStock(prev => {
      const newState = !prev;
      if (newState) setShowOutOfStock(false); // Turn off the other filter
      return newState;
    });
  };

  // Function to toggle out of stock products (SKU === 0)
  const handleShowOutOfStockProducts = () => {
    setShowOutOfStock(prev => {
      const newState = !prev;
      if (newState) setShowLowStock(false); // Turn off the other filter
      return newState;
    });
  };

  const handleReturnSkuClick = async (product) => {
    // make sure data is fresh before opening
    await refetchOrder();

    // Find orders with returnInfo for the matching product
    const returnOrders = orderList?.filter((order) =>
      (order.orderStatus === "Return Initiated" || order.orderStatus === "Refunded") && // ✅ only these statuses
      order.returnInfo?.products.some(
        (returnProduct) =>
          returnProduct.productId === product.productId &&
          returnProduct.size === product.size &&
          returnProduct.color.color === product.colorCode &&
          returnProduct.status === "Accepted"
      )
    );

    if (returnOrders?.length > 0) {
      // Collect all return information for the product
      const returnInfos = returnOrders.map((order) => {
        const matchingProduct = order.returnInfo.products.find(
          (p) =>
            p.productId === product.productId &&
            p.size === product.size &&
            p.color.color === product.colorCode
        );
        return {
          orderId: order.orderNumber,
          dateTime: order.returnInfo.dateTime,
          description: order.returnInfo.description,
          returnProduct: matchingProduct,
        };
      });
      setSelectedReturnInfos(returnInfos);
      onOpen();
    }
  };

  // filter forfeited items once
  const filteredReturnInfos = (selectedReturnInfos ?? []).filter(
    (ri) => ri?.returnProduct?.transferStatus !== "Forfeited"
  );

  // only open modal if there's something to show
  const shouldOpen = isOpen && filteredReturnInfos.length > 0;

  const hasTransferredHistory = (product) => {
    return orderList?.some((order) =>
      order.returnInfo?.products.some(
        (returnProduct) =>
          returnProduct.productId === product.productId &&
          returnProduct.size === product.size &&
          returnProduct.color.color === product.colorCode &&
          returnProduct.transferStatus === "Transferred"
      )
    );
  };

  const handleForfeitedSkuClick = async (product) => {
    // make sure data is fresh before opening
    await refetchOrder();

    // Find orders with returnInfo for the matching product
    const returnOrders = orderList?.filter((order) =>
      order.returnInfo?.products.some(
        (returnProduct) =>
          returnProduct.productId === product.productId &&
          returnProduct.size === product.size &&
          returnProduct.color.color === product.colorCode &&
          returnProduct.status === "Accepted" &&
          returnProduct.transferStatus === "Forfeited"
      )
    );

    if (returnOrders?.length > 0) {
      // Collect all return information for the product
      const returnInfos = returnOrders.map((order) => {
        const matchingProduct = order.returnInfo.products.find(
          (p) =>
            p.productId === product.productId &&
            p.size === product.size &&
            p.color.color === product.colorCode
        );
        return {
          orderId: order.orderNumber,
          dateTime: order.returnInfo.dateTime,
          description: order.returnInfo.description,
          returnProduct: matchingProduct,
        };
      });
      setSelectedForfeitedInfos(returnInfos);
      onOpen2();
    }
  };

  const handleTransferToAvailable = async (returnInfo, onClose) => {
    const status = returnInfo?.returnProduct?.status;
    const transferSku = returnInfo?.returnProduct?.sku;
    const productId = returnInfo?.returnProduct?.productId;
    const color = returnInfo?.returnProduct?.color;
    const size = returnInfo?.returnProduct?.size;
    const orderNumber = returnInfo?.orderId;

    if (status !== "Accepted") {
      toast.error("This item cannot be transferred unless it is Accepted.");
      return;
    };

    const info = {
      productId,
      transferSku,
      color,
      size,
      orderNumber
    };

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Return this SKU to available?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
      });
      if (result.isConfirmed) {
        const response = await axiosSecure.post(
          "/transferReturnSkuToAvailable",
          info
        );
        if (response.data.message) {
          toast.success(response.data.message);
          await refetch();
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to transfer SKU.");
    }
  };

  const handleForfeitItem = async (returnInfo, onClose) => {
    const status = returnInfo?.returnProduct?.status;
    const transferSku = returnInfo?.returnProduct?.sku;
    const productId = returnInfo?.returnProduct?.productId;
    const color = returnInfo?.returnProduct?.color;
    const size = returnInfo?.returnProduct?.size;
    const orderNumber = returnInfo?.orderId;

    if (status !== "Accepted") {
      toast.error("This item cannot be transferred unless it is Accepted.");
      return;
    };

    const info = {
      productId,
      transferSku,
      color,
      size,
      orderNumber
    };

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Forfeit this returned SKU?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
      });
      if (result.isConfirmed) {
        const response = await axiosSecure.post(
          "/transferReturnSkuToForfeited",
          info
        );
        if (response.data.message) {
          toast.success(response.data.message);
          await refetch();
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to transfer SKU.");
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside2);
    return () => document.removeEventListener('mousedown', handleClickOutside2);
  }, [])

  useEffect(() => {
    if (paginatedProducts?.length === 0) {
      setPage(0); // Reset to the first page if no data
    }
  }, [paginatedProducts]);

  if (isProductPending || isOrderPending || isLocationPending || isUserLoading) {
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
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[24%] xl:left-[19%] 2xl:left-[34%] bg-no-repeat'
      />

      <div className='px-6 mx-auto'>

        <div className='flex flex-wrap lg:flex-nowrap items-center justify-between py-2 md:py-5 gap-2'>

          <div className='w-full flex flex-col xl:flex-row items-center justify-start gap-3'>
            <LocationDropdown onLocationSelect={handleLocationSelect} />

            {/* Stock Filters */}
            <div ref={dropdownRef2} className="relative inline-block text-left">

              <button onClick={toggleDropdown2} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-white border border-dashed px-[14px] md:px-[16px] py-3 transition-[background-color] duration-300 ease-in-out text-[10px] md:text-[14px]">
                <p>
                  <span className='text-neutral-600 font-semibold'>Filter</span>
                  <span className='text-neutral-800 font-bold'>
                    {showLowStock ? `: Low Stock` : ""} {showOutOfStock ? `: Out Of Stock` : ""}
                  </span>
                </p>
                <svg
                  className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-300 ${isOpenDropdown2 ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpenDropdown2 && (
                <div className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-1">

                    <div className="p-1 flex flex-col gap-2">

                      {/* Low stock product Button */}
                      <button className={`relative z-[1] flex items-center justify-between rounded-lg px-[10px] md:px-[12px] py-2 transition-[background-color] duration-300 ease-in-out text-[10px] md:text-[14px] min-w-[150px] hover:bg-gray-200 ${showLowStock ? 'bg-gray-200' : ''}`} onClick={handleShowLowStockProducts}>
                        Low Stock {showLowStock ? <IoCheckmarkOutline size={14} /> : ""}
                      </button>

                      {/* Out of stock Button */}
                      <button className={`relative z-[1] flex items-center justify-between rounded-lg px-[10px] md:px-[12px] py-2 transition-[background-color] duration-300 ease-in-out text-[10px] md:text-[14px] min-w-[150px] hover:bg-gray-200 ${showOutOfStock ? 'border bg-gray-200' : ''}`} onClick={handleShowOutOfStockProducts}>
                        Out of Stock {showOutOfStock ? <IoCheckmarkOutline size={14} /> : ""}
                      </button>

                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>

          <div className='flex justify-center items-center gap-2 w-full'>
            {/* Export As */}
            <div ref={dropdownRef} className="relative inline-block text-left">

              <button onClick={toggleDropdown} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[14px] md:px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[10px] md:text-[14px] text-neutral-700 min-w-[150px]">
                EXPORT AS
                <svg
                  className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-300 ${isOpenDropdown ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpenDropdown && (
                <div className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-1">

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
                </div>
              )}
            </div>

            {/* Search Product Item */}
            <div className='w-full md:min-w-[300px] lg:min-w-[300px] xl:min-w-[400px] 2xl:min-w-600px]'>
              <li className="flex items-center relative group">
                <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  placeholder="Search By Product Details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white text-[#0d0c22] transition duration-300 ease-in-out focus:outline-none focus:border-[#9F5216]/30 focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base"
                />
              </li>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="custom-max-h-inventory overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                <th key="product" className="text-[10px] md:text-xs px-2 pr-2 xl:px-3 xl:pr-2 text-gray-700 border-b pl-20 xl:pl-20">Product</th>
                <th key="pending" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Pending</th>
                <th key="onProcess" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">On Process</th>
                <th key="available" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">SKU Available</th>
                <th key="onHand" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">SKU On Hand</th>
                <th key="returnSku" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Return SKU</th>
                <th key="forfeitedSku" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Forfeited SKU</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500 py-80">
                    <h1 className="text-xl font-semibold text-neutral-800">No Products Available!</h1>
                    <div>
                      {locationNameForMessage === "" ? (
                        <span>Please  <span className='font-bold text-lg text-black'>select</span> a location to view inventory.</span>
                      ) : (
                        <div>
                          <h1>Please update inventory for this location.</h1>
                          <p>
                            Currently, there are no products in stock for <span className='font-bold text-lg text-black'>{locationNameForMessage}</span>.
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                </tr>
              ) : (
                paginatedProducts?.map((product, index) => {
                  // Calculate "onProcess" and "available"
                  let onPending = 0; // Default value
                  let onProcess = 0; // Default value
                  // let 

                  // Check for matching products in the orderList
                  orderList?.forEach(order => {
                    order?.productInformation.forEach(orderProduct => {
                      const isMatchingProduct =
                        product?.productId === orderProduct?.productId &&
                        product?.size === orderProduct?.size &&
                        product?.colorCode === orderProduct.color?.color;

                      if (isMatchingProduct) {
                        if (order?.orderStatus === "Pending") {
                          onPending += orderProduct?.sku;
                        }
                        else if (order?.orderStatus === "Processing") {
                          // Subtract from "available"
                          onProcess += orderProduct?.sku;
                        }
                      }
                    });
                  });

                  return (
                    <tr key={product?._id || index} className="hover:bg-gray-50 transition-colors">
                      <td key="product" className="text-sm p-3 text-neutral-500 text-center cursor-pointer flex flex-col lg:flex-row items-center gap-3">
                        <div>
                          <Image
                            className="h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5"
                            src={product?.imageUrl}
                            alt={product?.productTitle}
                            height={600}
                            width={600}
                          />
                        </div>
                        <div className="flex flex-col items-start justify-start gap-1">
                          <p className="font-bold text-blue-700 text-start">{product?.productTitle}</p>
                          <p className="font-medium">{product?.size}</p>
                          <span className="flex items-center gap-2">{product?.color}</span>
                        </div>
                      </td>
                      <td key="pending" className="text-center"> {isMatchingLocation ? onPending : 0}</td>
                      <td key="onProcess" className="text-center"> {isMatchingLocation ? onProcess : 0}</td>
                      <td key="available" className="text-center"> {product?.sku}</td>
                      <td key="onHand" className="text-center">{product?.onHandSku}</td>
                      <td
                        key="returnSku"
                        onClick={() =>
                          (product?.returnSku > 0 || hasTransferredHistory(product)) &&
                          handleReturnSkuClick(product)
                        }
                        className={`text-center ${product?.returnSku > 0
                          ? "text-blue-600 cursor-pointer"
                          : (hasTransferredHistory(product) && isMatchingLocation)
                            ? "cursor-pointer"
                            : ""
                          }`}
                      >
                        {(product?.returnSku === 0 && hasTransferredHistory(product) && isMatchingLocation) ? (
                          <span className="flex items-center justify-center gap-1 text-blue-600">
                            0 <FaHistory className="text-amber-500" size={14} title="Transferred history" />
                          </span>
                        ) : (
                          product?.returnSku
                        )}
                      </td>
                      <td onClick={() => handleForfeitedSkuClick(product)} key="forfeitedSku" className={`text-center ${product?.forfeitedSku > 0 ? "text-blue-600 cursor-pointer" : ""
                        }`}>
                        {product?.forfeitedSku}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

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

      <Modal isOpen={shouldOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-gray-200">
                <h2 className="text-lg font-semibold px-2">Return Details</h2>
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                {selectedReturnInfos.length > 0 ? (
                  <div className="space-y-6">
                    {selectedReturnInfos
                      .filter((returnInfo) => returnInfo?.returnProduct?.transferStatus !== "Forfeited") // skip forfeited
                      .map((returnInfo, index) => {
                        return (
                          <div key={index} className={`bg-white p-4 space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0`}>

                            <p>
                              <span className="font-semibold text-gray-900">Order ID:</span>{" "}
                              {returnInfo?.orderId}
                            </p>

                            <p>
                              <span className="font-semibold text-gray-900">Date of Return:</span>{" "}
                              {returnInfo?.dateTime}
                            </p>

                            {returnInfo?.returnProduct?.issues?.length > 0 && (
                              <p>
                                <span className="font-semibold text-gray-900">Issues:</span>{" "}
                                <span className="text-gray-700">
                                  {returnInfo.returnProduct.issues.join(", ")}
                                </span>
                              </p>
                            )}

                            {returnInfo?.description && (
                              <p>
                                <span className="font-semibold text-gray-900">Description:</span>{" "}
                                {returnInfo?.description}
                              </p>
                            )}

                            <div className='flex justify-between items-center'>

                              {returnInfo?.returnProduct?.status === "Accepted" && (
                                <p>
                                  <span className="font-semibold text-gray-900">Return SKU:</span>{" "}
                                  {returnInfo?.returnProduct?.sku}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="mt-1 flex flex-wrap justify-end gap-3">

                                {returnInfo?.returnProduct?.transferStatus === "Transferred" ?
                                  <p className='py-1 font-semibold bg-green-100 text-green-700 text-xs px-2 rounded-full'>
                                    Already Transferred to Available
                                  </p>
                                  :
                                  <>
                                    {isOwner &&
                                      <>
                                        <button
                                          className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-200"
                                          onClick={() => handleTransferToAvailable(returnInfo, onClose)}
                                        >
                                          <BiTransferAlt size={14} />
                                          Transfer to Available SKU
                                        </button>
                                        <button
                                          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                                          onClick={() => handleForfeitItem(returnInfo, onClose)}
                                        >
                                          <BiMinusCircle size={14} />
                                          Forfeit this Item
                                        </button>
                                      </>
                                    }
                                  </>
                                }
                              </div>

                            </div>

                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p>No return information available.</p>
                )}
              </ModalBody>
              <ModalFooter className='flex justify-end items-center border'>
                <div className='flex gap-4 items-center'>
                  <Button size='sm' color='danger' variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen2} onOpenChange={onOpenChange2} size='2xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-gray-200">
                <h2 className="text-lg font-semibold px-2">Forfeited Details</h2>
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                {selectedForfeitedInfos.length > 0 ? (
                  <div className="space-y-6">
                    {selectedForfeitedInfos
                      .filter((returnInfo) => returnInfo?.returnProduct?.transferStatus !== "Transferred") // skip transferred
                      .map((returnInfo, index) => {
                        return (
                          <div key={index} className={`bg-white p-4 space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0`}>

                            <p>
                              <span className="font-semibold text-gray-900">Order ID:</span>{" "}
                              {returnInfo?.orderId}
                            </p>

                            <p>
                              <span className="font-semibold text-gray-900">Date of Return:</span>{" "}
                              {returnInfo?.dateTime}
                            </p>

                            {returnInfo?.returnProduct?.issues?.length > 0 && (
                              <p>
                                <span className="font-semibold text-gray-900">Issues:</span>{" "}
                                <span className="text-gray-700">
                                  {returnInfo.returnProduct.issues.join(", ")}
                                </span>
                              </p>
                            )}

                            {returnInfo?.description && (
                              <p>
                                <span className="font-semibold text-gray-900">Description:</span>{" "}
                                {returnInfo?.description}
                              </p>
                            )}

                            <div className='flex justify-between items-center'>

                              {returnInfo?.returnProduct?.status === "Accepted" && (
                                <p>
                                  <span className="font-semibold text-gray-900">Forfeited SKU:</span>{" "}
                                  {returnInfo?.returnProduct?.sku}
                                </p>
                              )}

                            </div>

                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p>No forfeited information available.</p>
                )}
              </ModalBody>
              <ModalFooter className='flex justify-end items-center border'>
                <div className='flex gap-4 items-center'>
                  <Button size='sm' color='danger' variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default Inventory;