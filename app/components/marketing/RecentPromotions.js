import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { MdOutlineModeEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import useOrders from '@/app/hooks/useOrders';
import usePromoCodes from '@/app/hooks/usePromoCodes';
import toast from 'react-hot-toast';
import useOffers from '@/app/hooks/useOffers';
import SmallHeightLoading from '../shared/Loading/SmallHeightLoading';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import { Button, Checkbox, CheckboxGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { TbColumnInsertRight } from 'react-icons/tb';
import { HiOutlineDownload } from 'react-icons/hi';
import { useAuth } from '@/app/contexts/auth';
import CustomSwitch from '../shared/switch/CustomSwitch';

const initialColumns = ["Promo Code / Offer Title", "Type", "Discount Value", "Expiry Date", "Total Times Applied", "Total Discount Given", "Min Order Amount", "Max Capped Amount", "Actions", "Status"];

const currentModule = "Marketing";

const RecentPromotions = () => {

  const dropdownRef = useRef(null);
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const [orderList, isOrderPending] = useOrders();
  const [promoList, isPromoPending, refetchPromo] = usePromoCodes();
  const [offerList, isOfferPending, refetchOffer] = useOffers();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOption, setSelectedOption] = useState('all'); // New state for dropdown
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState(initialColumns);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  const roleBasedColumnRestrictions = useMemo(() => ({
    Viewer: ["Actions", "Status"],
    Editor: ["Status"],
    Owner: [], // Owner has access to all columns
  }), []);

  const getAllowedColumns = useCallback((role) => {
    return initialColumns?.filter(col => !roleBasedColumnRestrictions[role]?.includes(col));
  }, [roleBasedColumnRestrictions]);

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem("selectedMarketing"));
    const savedMarketingColumns = JSON.parse(localStorage.getItem("selectedMarketingColumns"));

    // Get allowed columns based on role
    const allowedColumns = getAllowedColumns(role);

    if (savedColumns) {
      setSelectedColumns(savedColumns?.filter(col => allowedColumns?.includes(col)));
    } else {
      setSelectedColumns(allowedColumns);
    }

    if (savedMarketingColumns) {
      setColumnOrder(savedMarketingColumns?.filter(col => allowedColumns?.includes(col)));
    } else {
      setColumnOrder(allowedColumns);
    }
  }, [role, getAllowedColumns]); // Ensure it updates when role changes

  const handleColumnChange = (selected) => {
    const allowedColumns = getAllowedColumns(role);
    setSelectedColumns(selected?.filter(col => allowedColumns?.includes(col)));
  };

  const handleSelectAll = () => {
    const allowedColumns = getAllowedColumns(role);
    setSelectedColumns(allowedColumns);
    setColumnOrder(allowedColumns);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSave = () => {
    localStorage.setItem('selectedMarketing', JSON.stringify(selectedColumns));
    localStorage.setItem('selectedMarketingColumns', JSON.stringify(columnOrder));
    setColumnModalOpen(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const allowedColumns = getAllowedColumns(role);
    const reorderedColumns = Array.from(columnOrder);

    // Find dragged column
    const [draggedColumn] = reorderedColumns.splice(result.source.index, 1);

    // Prevent reordering restricted columns
    if (!allowedColumns.includes(draggedColumn)) return;

    reorderedColumns.splice(result.destination.index, 0, draggedColumn);
    setColumnOrder(reorderedColumns);
  };

  // Memoized current date
  const currentDate = useMemo(() => new Date(), []);

  // Memoized active promos
  const activePromos = useMemo(() => {
    return promoList?.filter(promo => new Date(promo?.expiryDate) >= currentDate);
  }, [promoList, currentDate]);

  // Memoized expired promos
  const expiredPromos = useMemo(() => {
    return promoList?.filter(promo => new Date(promo?.expiryDate) < currentDate);
  }, [promoList, currentDate]);

  // Combined "All" promos
  const allPromos = useMemo(() => {
    return [...(activePromos || []), ...(expiredPromos || [])];
  }, [activePromos, expiredPromos]);

  // Memoized active offers
  const activeOffers = useMemo(() => {
    return offerList?.filter(promo => new Date(promo?.expiryDate) >= currentDate);
  }, [offerList, currentDate]);

  // Memoized expired offers
  const expiredOffers = useMemo(() => {
    return offerList?.filter(promo => new Date(promo?.expiryDate) < currentDate);
  }, [offerList, currentDate]);

  // Combined "All" offers
  const allOffers = useMemo(() => {
    return [...(activeOffers || []), ...(expiredOffers || [])];
  }, [activeOffers, expiredOffers]);

  const allItems = useMemo(() => {
    const combinedItems = [
      ...(promoList || []), // Contains all promos
      ...(offerList || []), // Contains all offers
    ];

    // Sort combined items by _id (MongoDB ObjectId) or createdAt field
    return combinedItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);

      return dateB - dateA; // Newest first
    });
  }, [promoList, offerList]);

  const calculateTotalPromoApplied = (promoCode) => {
    return orderList?.filter(order => order?.promoInfo?.promoCode === promoCode && order?.paymentInfo?.paymentStatus === "Paid").length || 0;
  };

  const calculateTotalPromoAmountDiscounted = (promoCode) => {
    // Use reduce and ensure acc always starts as a number
    const totalDiscount = orderList?.reduce((acc, order) => {
      // Check if the promoCode matches and payment is paid
      if (order?.promoInfo?.promoCode !== promoCode || order?.paymentInfo?.paymentStatus !== "Paid") {
        return acc;
      }

      // Add appliedPromoDiscount if it exists, otherwise add 0
      const promoDiscount = parseFloat(order?.promoInfo?.appliedPromoDiscount) || 0;
      return acc + promoDiscount;
    }, 0) || 0; // Default to 0 if reduce returns undefined

    // Ensure totalDiscount is a number before calling toFixed
    return Number(totalDiscount).toFixed(2);
  };

  const calculateTotalOfferApplied = (offerTitle) => {
    return orderList?.reduce((count, order) => {
      const offerCount = (order?.paymentInfo?.paymentStatus === "Paid" && order?.productInformation.filter(
        product => product?.offerInfo?.offerTitle === offerTitle
      ).length) || 0; // Check for payment status
      return count + offerCount;
    }, 0) || 0;
  };

  const calculateTotalOfferAmountDiscounted = (offerTitle) => {
    const totalDiscount = orderList?.reduce((acc, order) => {
      // Skip orders where payment status is not "Paid"
      if (order.paymentInfo.paymentStatus !== "Paid") return acc;

      // Calculate total applied offer discount for the given offer title
      const offerDiscountTotal = order.productInformation.reduce((prodAcc, product) => {
        // Skip products where the offer title does not match
        if (product.offerInfo?.offerTitle !== offerTitle) return prodAcc;

        // Add the applied offer discount
        return prodAcc + (product.offerInfo.appliedOfferDiscount || 0);
      }, 0);

      return acc + offerDiscountTotal;
    }, 0) || 0;

    // Ensure totalDiscount is a valid number and format it
    return Number(totalDiscount).toFixed(2);
  };

  const getProductTitlesForPromo = (promoCode) => {
    const productTitles = [];

    orderList.forEach(order => {
      if (order?.promoInfo?.promoCode === promoCode && order.paymentInfo.paymentStatus === "Paid") { // Check for payment status
        order.productInformation.forEach(product => {
          productTitles.push(product.productTitle); // Adjust this to your actual product title field
        });
      }
    });

    return productTitles;
  };

  const getProductTitlesForOffer = (offerTitle) => {
    const productTitles = [];

    orderList.forEach(order => {
      if (order.paymentInfo.paymentStatus === "Paid") { // Check for payment status
        order.productInformation.forEach(product => {
          if (product?.offerInfo?.offerTitle === offerTitle) {
            productTitles.push(product.productTitle); // Adjust this to your actual product title field
          }
        });
      }
    });

    return productTitles;
  };

  // Function to filter based on the search query and tab/dropdown selection
  const filterItems = (items) => {

    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();

    return items.filter(item => {

      // Get calculated totals for promo/offer
      const totalPromoApplied = item?.promoCode ? calculateTotalPromoApplied(item.promoCode) : 0;
      const totalAmountDiscounted = item?.promoCode ? calculateTotalPromoAmountDiscounted(item.promoCode) : '0.00';
      const totalOfferApplied = item?.offerTitle ? calculateTotalOfferApplied(item.offerTitle) : 0;
      const totalOfferAmountDiscounted = item?.offerTitle ? calculateTotalOfferAmountDiscounted(item.offerTitle) : '0.00';

      // Get product titles for promo and offer
      const promoProductTitles = getProductTitlesForPromo(item.promoCode);
      const offerProductTitles = getProductTitlesForOffer(item.offerTitle);

      // Check for product titles in the search query
      const productTitleMatch = promoProductTitles.some(title => title.toLowerCase().includes(query)) ||
        offerProductTitles.some(title => title.toLowerCase().includes(query));

      // Return true if any of the item's details or calculated values match the query
      return (
        item?.promoCode?.toLowerCase().includes(query) ||
        item?.offerTitle?.toLowerCase().includes(query) ||
        item?.expiryDate?.toLowerCase().includes(query) ||
        item?.minAmount?.toString().includes(query) ||
        item?.maxAmount?.toString().includes(query) ||
        (item?.promoDiscountValue && item.promoDiscountValue.toString().includes(query)) ||
        (item?.promoDiscountType && item.promoDiscountType.toLowerCase().includes(query)) ||
        (item?.offerDiscountValue && item.offerDiscountValue.toString().includes(query)) ||
        (item?.offerDiscountType && item.offerDiscountType.toLowerCase().includes(query)) ||
        totalPromoApplied.toString().includes(query) ||
        totalAmountDiscounted.toString().includes(query) ||
        totalOfferApplied.toString().includes(query) ||
        totalOfferAmountDiscounted.toString().includes(query) ||
        productTitleMatch // Check for product titles
      );
    });
  };

  const handleDeletePromo = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.delete(`/deletePromo/${id}`);
          if (res?.data?.deletedCount) {
            refetchPromo();
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
                        Promo Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        The promo has been successfully deleted!
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
        } catch (error) {
          toast.error('Failed to delete promo. Please try again!');
        }
      }
    });
  };

  const handleDeleteOffer = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.delete(`/deleteOffer/${id}`);
          if (res?.data?.deletedCount) {
            refetchOffer();
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
                        Offer Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        The offer has been successfully deleted!
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
        } catch (error) {
          toast.error('Failed to delete offer. Please try again!');
        }
      }
    });
  };

  const handleStatusChangePromo = async (id, currentStatus) => {
    try {
      // Find the discount that needs to be updated
      const findDiscount = promoList.find(promo => promo?._id === id);
      if (!findDiscount) {
        toast.error('Promo not found.');
        return;
      }

      // Exclude the _id field from the discount data
      const { _id, ...rest } = findDiscount;
      const discountData = { ...rest, promoStatus: !currentStatus };

      // Send the update request
      const res = await axiosPublic.put(`/updatePromo/${id}`, discountData);
      if (res.data.modifiedCount > 0) {
        await refetchPromo(); // Refetch the promo list to get the updated data
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
                    Status Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Status updated successfully!
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
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing status:', error);
      toast.error('Failed to update status. Please try again!');
    }
  };

  const handleStatusChangeOffer = async (id, currentStatus) => {
    try {
      // Find the discount that needs to be updated
      const findDiscount = offerList.find(offer => offer?._id === id);
      if (!findDiscount) {
        toast.error('Offer not found.');
        return;
      }

      // Exclude the _id field from the discount data
      const { _id, ...rest } = findDiscount;
      const discountData = { ...rest, offerStatus: !currentStatus };

      // Send the update request
      const res = await axiosPublic.put(`/updateOffer/${id}`, discountData);
      if (res.data.modifiedCount > 0) {
        refetchOffer(); // Refetch the promo list to get the updated data
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
                    Status Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Status updated successfully!
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
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing status:', error);
      toast.error('Failed to update status. Please try again!');
    }
  };

  // Render the promos/offers table
  const renderItems = (items) => {
    const filteredItems = filterItems(items);

    if (!filteredItems.length) {
      return (
        <tbody>
          <tr>
            <td colSpan="12" className="text-center py-4">No items found</td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredItems.map((item, index) => {
          const isExpired = new Date(item?.expiryDate) < currentDate;
          // const isExpandedItem = isExpanded === item._id;

          const totalPromoApplied = item?.promoCode
            ? calculateTotalPromoApplied(item?.promoCode)
            : 0;

          const totalOfferApplied = item?.offerTitle
            ? calculateTotalOfferApplied(item?.offerTitle)
            : 0;

          const totalPromoAmountDiscounted = item?.promoCode
            ? calculateTotalPromoAmountDiscounted(item?.promoCode)
            : '0.00';

          const totalOfferAmountDiscounted = item?.offerTitle
            ? calculateTotalOfferAmountDiscounted(item?.offerTitle)
            : '0.00';

          return (
            <>
              <tr key={item?._id || index} className="hover:bg-gray-50 transition-colors">
                {columnOrder.map((column) =>
                  selectedColumns.includes(column) && (
                    <>
                      {column === 'Promo Code / Offer Title' && (
                        <td key="promoCodeOfferTitle" className="text-xs p-3 text-gray-700">
                          {item?.promoCode || item?.offerTitle}
                        </td>
                      )}
                      {column === 'Type' && (
                        <td key="type" className="text-xs p-3 text-gray-700">
                          {item?.promoCode ? 'Promo' : 'Offer'}
                        </td>
                      )}
                      {column === 'Discount Value' && (
                        <td key="discountValue" className="text-xs p-3 text-gray-700">
                          {item?.promoDiscountType
                            ? `${item?.promoDiscountValue} ${item?.promoDiscountType === 'Amount' ? 'Tk' : '%'}`
                            : item?.offerDiscountType
                              ? `${item?.offerDiscountValue} ${item?.offerDiscountType === 'Amount' ? 'Tk' : '%'}`
                              : 'No Discount'}
                        </td>
                      )}
                      {column === 'Expiry Date' && (
                        <td key="expiryDate" className="text-xs p-3 text-gray-700">
                          {item?.expiryDate}
                        </td>
                      )}
                      {column === 'Total Times Applied' && (
                        <td
                          key="totalTimesApplied"
                          className="text-xs p-3 text-center cursor-pointer text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            // Construct the search parameter based on the item
                            const searchParam = item?.promoCode ? `promo=${item.promoCode}` : `offer=${item.offerTitle}`;

                            // Open the orders page in a new tab
                            window.open(`/orders?${searchParam}`, '_blank');
                          }}
                        >
                          {item?.promoCode
                            ? `${totalPromoApplied} ${totalPromoApplied === 1 ? "Order" : "Orders"}`
                            : `${totalOfferApplied} ${totalOfferApplied === 1 ? "Order" : "Orders"}`}
                        </td>
                      )}
                      {column === 'Total Discount Given' && (
                        <td key="totalDiscountGiven" className="text-xs p-3 text-gray-700 text-center">
                          {item?.promoCode
                            ? `৳ ${totalPromoAmountDiscounted}`
                            : `৳ ${totalOfferAmountDiscounted}`}
                        </td>
                      )}
                      {column === 'Min Order Amount' && (
                        <td key="minOrderAmount" className="text-xs p-3 text-gray-700 text-center">
                          ৳ {item?.minAmount || '0'}
                        </td>
                      )}
                      {column === 'Max Capped Amount' && (
                        <td key="maxCappedAmount" className="text-xs p-3 text-gray-700 text-center">
                          ৳ {item?.maxAmount || '0'}
                        </td>
                      )}

                      {column === 'Actions' && isAuthorized && (
                        <td key="actions" className="text-xs p-3 text-gray-700">
                          <div className="flex items-center gap-3 cursor-pointer">

                            {isAuthorized &&
                              <div className="group relative">
                                <button
                                  disabled={isExpired || !isAuthorized}>
                                  <MdOutlineModeEdit
                                    onClick={() =>
                                      item?.promoCode
                                        ? router.push(`/marketing/promo/${item._id}`)
                                        : router.push(`/marketing/offer/${item._id}`)
                                    }
                                    size={22}
                                    className={`text-blue-500 ${isExpired || !isAuthorized ? 'cursor-not-allowed' : 'hover:text-blue-700 transition-transform transform hover:scale-105 hover:duration-200'}`}
                                  />
                                </button>
                                {!isExpired && <span className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">

                                  {isExpired ? "Expired"
                                    : !isAuthorized
                                      ? "N/A"
                                      : "Edit"}
                                </span>}
                              </div>
                            }

                            {isOwner &&
                              <div className="group relative">

                                <button disabled={isExpired || !isOwner}>
                                  <RiDeleteBinLine
                                    onClick={() =>
                                      item?.promoCode
                                        ? handleDeletePromo(item._id)
                                        : handleDeleteOffer(item._id)
                                    }
                                    size={22}
                                    className={`text-red-500 ${isExpired || !isOwner ? 'cursor-not-allowed' : 'hover:text-red-700 transition-transform transform hover:scale-105 hover:duration-200'}`}
                                  />
                                </button>
                                {!isExpired && <span className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                                  {isExpired
                                    ? "Expired"
                                    : !isOwner
                                      ? "N/A"
                                      : "Delete"
                                  }
                                </span>}
                              </div>
                            }

                          </div>
                        </td>
                      )}

                      {column === 'Status' && isOwner && (
                        <td key="status" className="text-xs p-3 text-gray-700">
                          {isOwner &&
                            <CustomSwitch
                              checked={item?.promoCode ? item?.promoStatus : item?.offerStatus}
                              onChange={() => item?.promoCode ? handleStatusChangePromo(item?._id, item?.promoStatus) : handleStatusChangeOffer(item?._id, item?.offerStatus)}
                              size="md"
                              color="primary"
                              // disabled={isExpired || (item?.promoCode ? !isTogglePromoButtonAllowed : !isToggleOfferButtonAllowed)}
                              disabled={isExpired}
                            />
                          }
                        </td>
                      )}

                    </>
                  )
                )}
              </tr>
            </>
          )
        })}
      </tbody>
    );
  };

  // Handle the dropdown change
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setActiveTab('all'); // Reset the active tab when switching between promos and offers
  };

  const itemsToRender = () => {
    if (selectedOption === 'promos') {
      return activeTab === 'all' ? allPromos : activeTab === 'active' ? activePromos : expiredPromos;
    } else if (selectedOption === 'offers') {
      return activeTab === 'all' ? allOffers : activeTab === 'active' ? activeOffers : expiredOffers;
    } else {
      // Combined promos and offers sorted by creation date
      return allItems;
    }
  };

  // Use the new itemsToRender function when rendering
  const filteredItems = filterItems(itemsToRender());

  const renderHeading = () => {
    switch (selectedOption) {
      case "offers":
        return "Offer Title";
      case "promos":
        return "Promo Code";
      default:
        return "Promo Code / Offer Title";
    }
  };

  const toggleDropdown = () => setIsOpenDropdown(!isOpenDropdown);

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpenDropdown(false);
    }
  };

  const getFilteredItems = () => {
    const itemsToRenderList = itemsToRender(); // Get the base items to render based on the selected option and active tab
    return filterItems(itemsToRenderList); // Apply additional filtering
  };

  const exportToCSV = () => {
    let dataToExport = getFilteredItems(); // Get the filtered items based on your filtering logic

    const filteredData = dataToExport.map(item => {
      const data = {};

      // Loop through columnOrder and include only the selected columns in the correct order
      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case 'Promo Code / Offer Title':
              data['Promo Code / Offer Title'] = item.promoCode || item.offerTitle;
              break;
            case 'Type':
              data['Type'] = item.promoCode ? 'Promo' : 'Offer';
              break;
            case 'Discount Value':
              data['Discount Value'] = item.promoCode ? item.promoDiscountValue : item.offerDiscountValue || '0.00';
              break;
            case 'Expiry Date':
              data['Expiry Date'] = item.expiryDate;
              break;
            case 'Total Times Applied':
              data['Total Times Applied'] = item.promoCode ? calculateTotalPromoApplied(item.promoCode) : calculateTotalOfferApplied(item.offerTitle);
              break;
            case 'Total Discount Given':
              data['Total Discount Given'] = item.promoCode ? calculateTotalPromoAmountDiscounted(item.promoCode) : calculateTotalOfferAmountDiscounted(item.offerTitle) || '0.00';
              break;
            case 'Min Order Amount':
              data['Min Order Amount'] = item.minAmount || '0';
              break;
            case 'Max Capped Amount':
              data['Max Capped Amount'] = item.maxAmount || '0';
              break;
            case 'Status':
              if (isOwner) {
                const isActive = item.promoStatus || item.offerStatus;
                data['Status'] = isActive ? 'Active' : 'Inactive';
              }
              break;
            default:
              break;
          }
        }
      });

      return data;
    });

    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'promotions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF('landscape');

    // Define the columns based on columnOrder
    const columns = columnOrder
      .filter((col) => selectedColumns.includes(col) && col !== 'Actions' && (col !== 'Status' || isOwner))
      .map((col) => ({
        header: col,
        dataKey: col,
      }));

    const rows = getFilteredItems().map(item => {
      const rowData = {};

      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case 'Promo Code / Offer Title':
              rowData['Promo Code / Offer Title'] = item.promoCode || item.offerTitle;
              break;
            case 'Type':
              rowData['Type'] = item.promoCode ? 'Promo' : 'Offer';
              break;
            case 'Discount Value':
              rowData['Discount Value'] = item.promoCode ? item.promoDiscountValue : item.offerDiscountValue || '0.00';
              break;
            case 'Expiry Date':
              rowData['Expiry Date'] = item.expiryDate;
              break;
            case 'Total Times Applied':
              rowData['Total Times Applied'] = item.promoCode ? calculateTotalPromoApplied(item.promoCode) : calculateTotalOfferApplied(item.offerTitle);
              break;
            case 'Total Discount Given':
              rowData['Total Discount Given'] = item.promoCode ? calculateTotalPromoAmountDiscounted(item.promoCode) : calculateTotalOfferAmountDiscounted(item.offerTitle) || '0.00';
              break;
            case 'Min Order Amount':
              rowData['Min Order Amount'] = item.minAmount || '0';
              break;
            case 'Max Capped Amount':
              rowData['Max Capped Amount'] = item.maxAmount || '0';
              break;
            case 'Status':
              if (isOwner) {
                const isActive = item.promoStatus || item.offerStatus;
                rowData['Status'] = isActive ? 'Active' : 'Inactive';
              }
              break;
            default:
              break;
          }
        }
      });

      return rowData;
    });

    autoTable(doc, {
      columns: columns,
      body: rows,
      startY: 10,
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },
      headStyles: { halign: 'center', valign: 'middle' },
      theme: "striped",
    });

    doc.save("Filtered_Promotions.pdf");
  };

  const exportToXLS = () => {
    let dataToExport = getFilteredItems(); // Get the filtered items based on your filtering logic

    const filteredData = dataToExport.map(item => {
      const data = {};

      columnOrder.forEach((col) => {
        if (selectedColumns.includes(col)) {
          switch (col) {
            case 'Promo Code / Offer Title':
              data['Promo Code / Offer Title'] = item.promoCode || item.offerTitle || "";
              break;
            case 'Type':
              data['Type'] = item.promoCode ? 'Promo' : 'Offer';
              break;
            case 'Discount Value':
              data['Discount Value'] = item.promoCode ? item.promoDiscountValue || "" : item.offerDiscountValue || "0.00";
              break;
            case 'Expiry Date':
              data['Expiry Date'] = item.expiryDate || "";
              break;
            case 'Total Times Applied':
              data['Total Times Applied'] = item.promoCode ? calculateTotalPromoApplied(item.promoCode) : calculateTotalOfferApplied(item.offerTitle) || "";
              break;
            case 'Total Discount Given':
              data['Total Discount Given'] = item.promoCode ? calculateTotalPromoAmountDiscounted(item.promoCode) : calculateTotalOfferAmountDiscounted(item.offerTitle) || "0.00";
              break;
            case 'Min Order Amount':
              data['Min Order Amount'] = item.minAmount || "0";
              break;
            case 'Max Capped Amount':
              data['Max Capped Amount'] = item.maxAmount || "0";
              break;
            case 'Status':
              if (isOwner) {
                const isActive = item.promoStatus || item.offerStatus;
                data['Status'] = isActive ? 'Active' : 'Inactive';
              }
              break;
            default:
              break;
          }
        }
      });

      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotions');
    XLSX.writeFile(workbook, 'promotions.xlsx');
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isPromoPending || isOrderPending || isOfferPending || isUserLoading) {
    return <SmallHeightLoading />;
  }

  return (
    <div className='max-w-screen-2xl mx-auto'>
      <div className='flex flex-wrap justify-between items-center gap-6 mb-6 pr-4'>
        <div className="flex-1 flex flex-col gap-4">
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className="border p-3 rounded-lg max-w-sm h-[44px] md:h-12 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="promos">Promos</option>
            <option value="offers">Offers</option>
          </select>
        </div>

        <div className="py-1">
          <button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[18px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[14px] text-neutral-700" onClick={() => { setColumnModalOpen(true) }}>
            Choose Columns <TbColumnInsertRight size={20} />
          </button>
        </div>

        <div ref={dropdownRef} className="relative inline-block text-left">

          <button onClick={toggleDropdown} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[14px] md:px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[10px] md:text-[14px] text-neutral-700">
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

                <div className="p-2 flex flex-col gap-2 w-full">

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
        <li className="flex-1 flex items-center md:min-w-96 relative group">
          <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            type="search"
            placeholder="Search By Promo/Offer Details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
          />
        </li>
      </div>

      {/* Conditionally render the tabs only if "All" is NOT selected */}
      {selectedOption !== 'all' && (
        <div className="flex items-center gap-4">
          <button
            className={`relative text-sm py-1 transition-all duration-300 ${activeTab === 'all' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'} after:absolute after:left-0 after:right-0 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300 ${activeTab === 'all' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('all')}
          >
            {selectedOption === 'promos' ? `All Promos (${allPromos.length})` : `All Offers (${allOffers.length})`}
          </button>
          <button
            className={`relative text-sm py-1 transition-all duration-300 ${activeTab === 'active' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'} after:absolute after:left-0 after:right-0 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300 ${activeTab === 'active' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('active')}
          >
            {selectedOption === 'promos' ? `Active (${activePromos.length})` : `Active (${activeOffers.length})`}
          </button>
          <button
            className={`relative text-sm py-1 transition-all duration-300 ${activeTab === 'expired' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'} after:absolute after:left-0 after:right-0 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300 ${activeTab === 'expired' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('expired')}
          >
            {selectedOption === 'promos' ? `Expired (${expiredPromos.length})` : `Expired (${expiredOffers.length})`}
          </button>
        </div>
      )}

      <div className="custom-max-discount custom-scrollbar overflow-x-auto my-4 drop-shadow rounded-lg w-full">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-[1] rounded-md">
            <tr>
              {columnOrder.map((column) => (
                <>
                  {column === 'Promo Code / Offer Title' && selectedColumns.includes(column) && (
                    <th key="promoCode" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      {renderHeading()}
                    </th>
                  )}
                  {column === 'Type' && selectedColumns.includes(column) && (
                    <th key="type" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Type
                    </th>
                  )}
                  {column === 'Discount Value' && selectedColumns.includes(column) && (
                    <th key="discountValue" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Discount Value
                    </th>
                  )}
                  {column === 'Expiry Date' && selectedColumns.includes(column) && (
                    <th key="expiryDate" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Expiry Date
                    </th>
                  )}
                  {column === 'Total Times Applied' && selectedColumns.includes(column) && (
                    <th key="totalTimesApplied" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300 text-center">
                      Total Times Applied
                    </th>
                  )}
                  {column === 'Total Discount Given' && selectedColumns.includes(column) && (
                    <th key="totalDiscountGiven" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Total Discount Given
                    </th>
                  )}
                  {column === 'Products Affected' && selectedColumns.includes(column) && (
                    <th key="productsAffected" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Products Affected
                    </th>
                  )}
                  {column === 'Min Order Amount' && selectedColumns.includes(column) && (
                    <th key="minOrderAmount" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Min Order Amount
                    </th>
                  )}
                  {column === 'Max Capped Amount' && selectedColumns.includes(column) && (
                    <th key="maxCappedAmount" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Max Capped Amount
                    </th>
                  )}
                  {column === 'Actions' && isAuthorized && selectedColumns.includes(column) && (
                    <th key="actions" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Actions
                    </th>
                  )}
                  {column === 'Status' && isOwner && selectedColumns.includes(column) && (
                    <th key="status" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                      Status
                    </th>
                  )}
                </>
              ))}
            </tr>
          </thead>

          {/* Conditional rendering based on the selected tab and dropdown */}
          {renderItems(filteredItems)}
        </table>
      </div>

      {/* Column Selection Modal */}
      {isColumnModalOpen &&
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
      }

    </div>
  );
};

export default RecentPromotions;