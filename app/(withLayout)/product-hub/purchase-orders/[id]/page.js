"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import Image from 'next/image';
// import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import Swal from 'sweetalert2';
import { FaUndo } from 'react-icons/fa';

import dynamic from 'next/dynamic';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useAuth } from '@/app/contexts/auth';
import LocationSelect from '@/app/components/product/select/LocationSelect';
import VendorSelect from '@/app/components/product/select/VendorSelect';
import Progressbar from '@/app/components/product/progress/Progressbar';
import ExitConfirmationModalProduct from '@/app/components/product/modal/ExitConfirmationModalProduct';
import PendingModalProduct from '@/app/components/product/modal/PendingModalProduct';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import HeadingText from '@/app/components/product/headingText/HeadingText';
import { getProductTitleById } from '@/app/components/product/productTitle/getProductTitleById';

const PurchaseOrderPDFButton = dynamic(() => import("@/app/components/product/pdf/PurchaseOrderPDFButton"), { ssr: false });

const currentModule = "Product Hub";

const EditPurchaseOrderPage = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedArrival, setEstimatedArrival] = useState(''); // Initial state set to an empty string
  const [dateError, setDateError] = useState(false)
  const [productList, isProductPending] = useProductsInformation();
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [shipping, setShipping] = useState(0);  // Initial value for shipping
  const [discount, setDiscount] = useState(0);  // Initial value for discount
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [purchaseOrderVariants, setPurchaseOrderVariants] = useState([]);
  const [purchaseOrderStatus, setPurchaseOrderStatus] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(0);  // Initial value for discount
  const [supplierNote, setSupplierNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPending, setIsModalOpenPending] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [headingMessage, setHeadingMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";
  const { data: session, status } = useSession();

  // Format date to yyyy-mm-dd for date input field
  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Update handleVariantChange to initialize values if not set
  const handleVariantChange = (index, field, value, productId, size, colorName, colorCode) => {
    setPurchaseOrderVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];

      // Initialize the variant object if it does not exist
      if (!updatedVariants[index]) {
        updatedVariants[index] = {};
      }

      // Set product title, size, and color properties
      if (!updatedVariants[index].productId) {
        updatedVariants[index].productId = productId;
        updatedVariants[index].size = size;

        // Assuming color is an object with code and name properties
        updatedVariants[index].color = {
          code: colorCode,
          name: colorName,
        };
      }

      // Update the specific field (in this case, quantity)
      updatedVariants[index][field] = value;

      return updatedVariants;
    });
  };

  // Step 3: Handle input changes
  const handleShippingChange = (e) => {
    setShipping(parseFloat(e.target.value) || 0);  // Update state with parsed value
  };

  const handleDiscountChange = (e) => {
    setDiscount(parseFloat(e.target.value) || 0);  // Update state with parsed value
  };

  // Memoized function to fetch purchase order data
  const fetchPurchaseOrderData = useCallback(async () => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    try {
      const response = await axiosSecure.get(`/getSinglePurchaseOrder/${id}`);
      const order = response?.data;

      // Reset the form with the new data from the response
      reset({
        shipping: order?.shippingCharge,
        discount: order?.discountCharge,
        referenceNumber: order?.referenceNumber,
        supplierNote: order?.supplierNote,
        estimatedArrival: formatDateForInput(order.estimatedArrival),
      });

      const fetchedEstimatedArrival = formatDateForInput(order.estimatedArrival);
      setEstimatedArrival(fetchedEstimatedArrival);
      setSelectedVendor(order?.supplier);
      setSelectedLocation(order?.destination);
      setPaymentTerms(order?.paymentTerms);
      setValue('shipping', order?.shippingCharge);
      setValue('discount', order?.discountCharge);
      setValue('referenceNumber', order?.referenceNumber);
      setValue('supplierNote', order?.supplierNote);
      setShipping(order?.shippingCharge);
      setDiscount(order?.discountCharge);
      setSelectedProducts(order?.selectedProducts);
      setPurchaseOrderVariants(order?.purchaseOrderVariants);
      setPurchaseOrderStatus(order?.status);
      setPurchaseOrderNumber(order?.purchaseOrderNumber);
      setReferenceNumber(order?.referenceNumber);
      setSupplierNote(order?.supplierNote);
      setAttachment(order?.attachment || "");

      setIsLoading(false);

      return order;
    } catch (err) {
      // console.error(err);
      // toast.error("Failed to fetch purchase order details!");
      router.push("/product-hub/purchase-orders")
      return null;
    }
  }, [id, setValue, axiosSecure, reset, session?.user?.accessToken, status, router]);

  // Initial load useEffect
  useEffect(() => {
    fetchPurchaseOrderData();
  }, [fetchPurchaseOrderData]);

  const handlePaymentTerms = (value) => {
    setPaymentTerms(value);
  }

  // Assuming purchaseOrderVariants is your array of variants
  const calculateTotals = () => {
    return purchaseOrderVariants.reduce(
      (acc, variant) => {
        const quantity = parseFloat(variant?.quantity) || 0; // Default to 0 if undefined or NaN
        const cost = parseFloat(variant?.cost) || 0; // Default to 0 if undefined or NaN
        const taxPercentage = parseFloat(variant?.tax) || 0; // Default to 0 if undefined or NaN

        // Calculate subtotal for this variant
        const subtotal = quantity * cost; // Subtotal: cost based on quantity
        const taxAmount = (subtotal * taxPercentage) / 100; // Calculate tax based on percentage

        // Update totals
        acc.totalQuantity += quantity; // Sum of quantities
        acc.totalSubtotal += subtotal; // Total subtotal of all variants
        acc.totalTax += taxAmount; // Sum of tax amounts

        return acc; // Return the accumulator for the next iteration
      },
      {
        totalQuantity: 0, // Initialize total quantity
        totalSubtotal: 0, // Initialize total subtotal (costs before tax)
        totalTax: 0, // Initialize total tax
      }
    );
  };
  const totals = calculateTotals();
  // Access totals
  const { totalQuantity, totalSubtotal, totalTax } = totals;

  // Calculate total price including tax
  const totalPrice = totalSubtotal + totalTax;
  const total = totalPrice + shipping - discount;

  const totalAcceptRejectValues = useMemo(() =>
    purchaseOrderVariants?.reduce(
      ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
        totalQuantity: totalQuantity + quantity,
        totalAccept: totalAccept + accept,
        totalReject: totalReject + reject,
      }),
      { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
    ),
    [purchaseOrderVariants]
  );

  // delete purchase order
  const handleDeletePurchaseOrder = async (id) => {
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
          const res = await axiosSecure.delete(`/deletePurchaseOrder/${id}`);
          if (res?.data?.deletedCount) {
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
                        Purchase order removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Purchase order has been deleted successfully!
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
            router.push("/product-hub/purchase-orders")
          }
        } catch (error) {
          toast.error('Failed to delete season. Please try again.');
        }
      }
    });
  }

  const handleCancelClick = () => {
    setModalMessage("After making as canceled you will not be able to receive incoming inventory from your supplier. This purchase order can't be turned into a pending again.");
    setHeadingMessage(("canceled"));
    setSelectedStatus("canceled");
    setIsModalOpen(true);
  };

  const handleConfirmClick = () => {
    setHeadingMessage(("ordered"));
    setModalMessage("After making as ordered you will be able to receive incoming inventory from your supplier. This purchase order can't be turned into a pending again.");
    setSelectedStatus("ordered");
    setIsModalOpen(true);
  };

  const handleReverseStatusPending = () => {
    setSelectedStatus("pending");
    setIsModalOpenPending(true);
  }

  const revertStatusToPending = async () => {
    try {
      const res = await axiosSecure.put(`/editPurchaseOrder/${id}`, { status: "pending" });

      if (res.data.modifiedCount > 0) {
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
                    Purchase order updated to pending!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Purchase order has been successfully updated to pending status!
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

        const updatedOrder = await fetchPurchaseOrderData();

        if (!updatedOrder) return;

        const updatedFormValues = {
          shipping: updatedOrder.shippingCharge || 0,
          discount: updatedOrder.discountCharge || 0,
          referenceNumber: updatedOrder.referenceNumber || "",
          supplierNote: updatedOrder.supplierNote || "",
          estimatedArrival: formatDateForInput(updatedOrder.estimatedArrival),
        };

        updatedOrder.purchaseOrderVariants.forEach((variant, index) => {
          updatedFormValues[`quantity-${index}`] = variant.quantity;
          updatedFormValues[`cost-${index}`] = variant.cost;
          updatedFormValues[`tax-${index}`] = variant.tax || '';
        });

        reset(updatedFormValues); // ✅ This now includes all fields

      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error("Failed to revert status:", error);
      toast.error("Failed to revert status. Please try again.");
    }
  };

  const onSubmit = async (data) => {

    data.status = selectedStatus;
    const { shipping, discount, referenceNumber, supplierNote, estimatedArrival, paymentTerms } = data;

    // Check if expiryDate is selected
    if (!estimatedArrival) {
      setDateError(true);
      return;  // Do not show toast here, just prevent submission
    }

    // If date is valid, reset the date error
    setDateError(false);

    const formattedEstimatedArrival = formatDateForInput(estimatedArrival);

    if (selectedProducts?.length === 0) {
      toast.error("Please add product.");
      return;
    }

    // Ensure required fields are filled
    for (const variant of purchaseOrderVariants) {
      if (!variant?.quantity || variant?.quantity <= 0) {
        toast.error("Quantity must be greater than 0 for all products.");
        return; // Prevent form submission
      }
      if (!variant.cost || variant.cost <= 0) {
        toast.error("Cost must be greater than 0 for all products.");
        return; // Prevent form submission
      }
    }

    try {
      const updatedPurchaseOrderData = {
        estimatedArrival: formattedEstimatedArrival,
        paymentTerms,
        supplier: selectedVendor,
        destination: selectedLocation,
        purchaseOrderVariants: purchaseOrderVariants?.map(variant => ({
          productId: variant.productId,
          quantity: parseFloat(variant.quantity),
          cost: parseFloat(variant.cost),
          tax: parseFloat(variant.tax) || 0,
          size: variant?.size,
          colorCode: variant.colorCode,  // Include the color code
          colorName: variant.colorName,   // Include the color name
        })),
        referenceNumber,
        supplierNote,
        shippingCharge: parseFloat(shipping) || 0,
        discountCharge: parseFloat(discount) || 0,
        totalPrice: parseFloat(total),
        status: data?.status,
        selectedProducts,
        attachment: attachment
      };

      const res = await axiosSecure.put(`/editPurchaseOrder/${id}`, updatedPurchaseOrderData);
      if (res.data.modifiedCount > 0) {
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
                    Purchase order Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Purchase order has been successfully updated!
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
        fetchPurchaseOrderData();
      } else {
        toast.error('No changes detected.');
      }

    } catch (error) {
      console.error('Error editing offer:', error);
      toast.error('Failed to update offer. Please try again!');
    }
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false); // Close the modal

    // Attempt to submit the form
    handleSubmit(onSubmit)()
      .then(() => {
        // If success, you may handle any additional actions here
      })
      .catch((error) => {
        // If there's an error in submission, open the modal again if needed
        setIsModalOpen(true);
        console.error("Submission error:", error);
      });
  };

  if (isLoading || isUserLoading || status === "loading" || isProductPending) {
    return <Loading />;
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex flex-wrap md:flex-nowrap items-center justify-between w-full'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>
            #{purchaseOrderNumber} <span
              className={`px-3 py-1 rounded-full font-semibold
      ${purchaseOrderStatus === "pending" ? "bg-yellow-100 text-yellow-600"
                  : purchaseOrderStatus === "ordered" ? "bg-blue-100 text-blue-600"
                    : purchaseOrderStatus === "received" ? "bg-green-100 text-green-600"
                      : purchaseOrderStatus === "canceled" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"}`}
            >
              {purchaseOrderStatus === "pending" ? "Pending"
                : purchaseOrderStatus === "ordered" ? "Ordered"
                  : purchaseOrderStatus === "received" ? "Received"
                    : purchaseOrderStatus === "canceled" ? "Canceled"
                      : "Unknown"}
            </span>
          </h3>
          <div className='flex justify-between md:justify-end gap-4 items-center w-full'>
            <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end' href={"/product-hub/purchase-orders"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
            <div className="flex gap-4 items-center">
              <PurchaseOrderPDFButton
                selectedVendor={selectedVendor}
                selectedLocation={selectedLocation}
                paymentTerms={paymentTerms}
                estimatedArrival={estimatedArrival}
                referenceNumber={referenceNumber}
                supplierNote={supplierNote}
                shipping={shipping}
                discount={discount}
                purchaseOrderVariants={purchaseOrderVariants}
                purchaseOrderNumber={purchaseOrderNumber}
                purchaseOrderStatus={purchaseOrderStatus}
                selectedProducts={selectedProducts.map((product) => ({
                  ...product,
                  productTitle: getProductTitleById(product?.productId, productList),
                }))}
              />
              {["ordered", "canceled"].includes(purchaseOrderStatus) && isOwner === true && <button type='button' onClick={handleReverseStatusPending}
                class="group relative inline-flex items-center justify-center w-[40px] h-[40px] bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 rounded-full shadow-lg transform scale-100 transition-transform duration-300"
              >
                <FaUndo size={20} className="rotate-0 transition ease-out duration-300 scale-100 group-hover:-rotate-45 group-hover:scale-75" />
              </button>}

              {isOwner &&
                <button onClick={() => handleDeletePurchaseOrder(id)}
                  class="group relative inline-flex items-center justify-center w-[40px] h-[40px] bg-[#D2016E] text-white rounded-full shadow-lg transform scale-100 transition-transform duration-300"
                >
                  <RiDeleteBinLine size={23} className="rotate-0 transition ease-out duration-300 scale-100 group-hover:-rotate-45 group-hover:scale-75" />
                </button>
              }

            </div>
          </div>
        </div>
      </div>

      {/* Your form code */}
      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto py-6 flex flex-col gap-4'>

          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? (
              <>
                <div className='flex-1 space-y-3'>
                  <h1 className='font-medium'>Supplier</h1>
                  {selectedVendor && (
                    <div className='space-y-3'>
                      <p className='font-semibold'>{selectedVendor?.value}</p>
                      <p className="text-neutral-500 font-medium">
                        {selectedVendor?.vendorAddress}
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex-1 space-y-3'>
                  <h1 className='font-medium'>Destination</h1>
                  {selectedLocation && (
                    <div className='space-y-3'>
                      <p className='font-semibold'>{selectedLocation?.locationName}</p>
                      <p className="text-neutral-500 font-medium">
                        {selectedLocation?.locationAddress}, {selectedLocation?.cityName}, {selectedLocation?.postalCode}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <VendorSelect
                  register={register}
                  errors={errors}
                  selectedVendor={selectedVendor}
                  setSelectedVendor={setSelectedVendor}
                />
                <LocationSelect
                  register={register}
                  errors={errors}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                />
              </>
            )}
          </div>

          <div className='bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>

              {/* Payment Terms */}
              <div className='flex-1'>
                <label htmlFor='paymentTerms' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Payment Terms <span className="text-red-600 pl-1">*</span></label>

                {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? (
                  <p className='font-semibold'>{paymentTerms}</p> // Display the value instead of select
                ) : (
                  <select
                    id="paymentTerms"
                    value={paymentTerms}
                    {...register('paymentTerms', { required: 'Please select payment terms.' })}
                    className='lg:w-1/2 font-semibold'
                    style={{ zIndex: 10, pointerEvents: 'auto', position: 'relative', outline: 'none' }}
                    onChange={(e) => handlePaymentTerms(e.target.value)}
                  >
                    <option value="" disabled>Select</option>
                    <option value="Cash on delivery">Cash on delivery</option>
                    <option value="Payment on receipt">Payment on receipt</option>
                    <option value="Payment in advance">Payment in advance</option>
                  </select>
                )}

                {errors.paymentTerms && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.paymentTerms.message}</p>
                )}
              </div>

              {/* Estimated Arrival */}
              <div className='flex-1'>
                <label htmlFor='estimatedArrival' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Estimated Arrival <span className="text-red-600 pl-1">*</span></label>

                {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? (
                  <p className='font-semibold'>{estimatedArrival}</p> // Display the value instead of input
                ) : (
                  <input
                    type="date"
                    id="estimatedArrival"
                    {...register("estimatedArrival", { required: purchaseOrderStatus === "pending" })}
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)} // Update state with the input value
                    className="w-full p-2 border rounded-md border-gray-300 outline-none focus:border-[#F4D3BA] focus:bg-white transition-colors duration-1000"
                  />
                )}

                {dateError && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">Expiry Date is required</p>
                )}
              </div>

            </div>

          </div>

          <div className='bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <div className='flex justify-between items-center gap-6'>
              <h1 className='font-bold text-lg flex-1'>
                <HeadingText orderStatus={purchaseOrderStatus} />
              </h1>
              <div className='flex-1'>
                {purchaseOrderStatus === "received" ? <div className=''>
                  <div className='flex flex-col'>
                    <Progressbar
                      accepted={totalAcceptRejectValues.totalAccept}
                      rejected={totalAcceptRejectValues.totalReject}
                      total={totalAcceptRejectValues.totalQuantity}
                    />
                    <div className="mt-1">
                      {totalAcceptRejectValues.totalAccept} of {totalAcceptRejectValues.totalQuantity}
                    </div>
                  </div>
                </div> : ""}
              </div>
            </div>

            {/* {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? "" : <div className='w-full pt-2'>
              <li className="flex items-center relative group border-2 rounded-lg">
                <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white text-[#0d0c22] transition duration-300 ease-in-out focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:bg-white  text-[12px] md:text-base"
                />
              </li>
            </div>} */}

            {selectedProducts?.length > 0 &&
              <div
                className={`max-w-screen-2xl mx-auto overflow-x-auto ${selectedProducts.length > 4 ? "overflow-y-auto max-h-[430px]" : ""
                  } custom-scrollbar relative mt-4`}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-[1] bg-white">
                    <tr>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b">
                        Products
                      </th>
                      {purchaseOrderStatus === "received" && (
                        <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                          Received
                        </th>
                      )}
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                        Quantity
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                        Cost
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                        Tax
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts?.map((product, index) => {
                      const quantity = parseFloat(purchaseOrderVariants[index]?.quantity) || 0; // Default to 0 if undefined or NaN
                      const cost = parseFloat(purchaseOrderVariants[index]?.cost) || 0; // Default to 0 if undefined or NaN
                      const taxPercentage = parseFloat(purchaseOrderVariants[index]?.tax) || 0; // Default to 0 if undefined or NaN

                      // Calculate total
                      const totalCost = quantity * cost; // Calculate cost based on quantity and cost per item
                      const taxAmount = (totalCost * taxPercentage) / 100; // Calculate tax based on percentage
                      const total = totalCost + taxAmount;

                      return (
                        <tr key={index} className={`${["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? "" : "hover:bg-gray-50"}`}>
                          <td className="text-sm p-3 text-neutral-500 text-center cursor-pointer flex flex-col lg:flex-row items-center gap-3">
                            <div>
                              <Image className='h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5' src={product?.imageUrl} alt={product?.productId} height={600} width={600} />
                            </div>
                            <div className='flex flex-col items-start justify-start gap-1'>
                              <p className='font-bold text-blue-700 text-start'>{getProductTitleById(product?.productId, productList)}</p>
                              <p className='font-medium'>{product?.size}</p>
                              <span className='flex items-center gap-2'>
                                {product.name}
                              </span>
                            </div>
                          </td>

                          {/* Progress Bar Column - Only for Received */}
                          {purchaseOrderStatus === "received" && (
                            <td className="text-sm p-3 text-neutral-500 font-semibold">
                              <div className="flex flex-col justify-center items-center">
                                <Progressbar
                                  accepted={purchaseOrderVariants[index]?.accept || 0}
                                  rejected={purchaseOrderVariants[index]?.reject || 0}
                                  total={purchaseOrderVariants[index]?.quantity}
                                />
                                <div className="mt-1 text-xs">
                                  {purchaseOrderVariants[index]?.accept || 0} of {purchaseOrderVariants[index]?.quantity}
                                </div>
                              </div>
                            </td>
                          )}

                          <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                            <input
                              id={`quantity-${index}`}
                              {...register(`quantity-${index}`, { required: purchaseOrderStatus === "pending" })}
                              value={purchaseOrderVariants[index]?.quantity || ''}
                              onChange={(e) => handleVariantChange(index, 'quantity', e.target.value, product?.productId, product?.size, product?.name, product.color)}
                              className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                              type="number"
                              min="0" // Prevents negative values in the input
                              disabled={["ordered", "received", "canceled"].includes(purchaseOrderStatus)}
                            />
                            {errors[`quantity-${index}`] && (
                              <p className="text-left pt-2 text-red-500 font-semibold text-xs">Quantity is required.</p>
                            )}
                          </td>
                          <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                            <div className="input-wrapper">
                              <span className="input-prefix">৳</span>
                              <input
                                id={`cost-${index}`}
                                {...register(`cost-${index}`, { required: purchaseOrderStatus === "pending" })}
                                value={purchaseOrderVariants[index]?.cost || ''}
                                onChange={(e) => handleVariantChange(index, 'cost', e.target.value, product?.productId, product?.size, product?.name, product.color)}
                                className="pl-7 custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                                type="number"
                                min="0" // Prevents negative values in the input
                                disabled={["ordered", "received", "canceled"].includes(purchaseOrderStatus)}
                              />
                            </div>
                            {errors[`cost-${index}`] && (
                              <p className="text-left pt-2 text-red-500 font-semibold text-xs">Cost is required.</p>
                            )}
                          </td>
                          <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                            <div className="input-wrapper">
                              <input
                                id={`tax-${index}`}
                                {...register(`tax-${index}`)} // No required validation here
                                value={purchaseOrderVariants[index]?.tax || ''}
                                onChange={(e) => handleVariantChange(index, 'tax', e.target.value, product?.productId, product?.size, product?.name, product.color)}
                                className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                                type="number"
                                disabled={["ordered", "received", "canceled"].includes(purchaseOrderStatus)}
                              />
                              <span className="input-suffix">%</span>
                            </div>
                          </td>
                          <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                            <div className='flex gap-3 w-full justify-center items-center'>
                              <p className="font-bold flex gap-1 text-neutral-500"><span>৳</span> {total.toFixed(2)}</p> {/* Display the total */}
                              {/* {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? "" : <button
                                type="button"  // Set type to "button" to prevent form submission
                                onClick={() => removeSelectedProduct(product, product.size, product.color)}
                                className="hover:text-red-700 text-gray-700"
                                aria-label="Remove product"
                              >
                                <RxCross2 size={18} />
                              </button>} */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
            {selectedProducts?.length > 0 && <p className='px-4 pt-4 text-neutral-500 font-medium'>{selectedProducts?.length} variants on purchase order</p>}
          </div>

          <div className='flex flex-col lg:flex-row w-full justify-between items-start gap-6'>

            {/* Additional Details */}
            <div className='flex-1 flex flex-col w-full gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
              {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? (
                <div className='min-h-[272px] space-y-6'>
                  <h1 className='font-semibold'>Additional Details</h1>
                  <div>
                    <label htmlFor='referenceNumber' className='flex justify-start font-semibold text-neutral-900 pb-2'>Reference Number</label>
                    <p className='text-neutral-500'>{referenceNumber === "" ? "--" : referenceNumber}</p>
                  </div>
                  <div>
                    <label htmlFor='supplierNote' className='flex justify-start font-semibold text-neutral-900 pb-2'>Note to supplier</label>
                    <p className='text-neutral-500'>{supplierNote === "" ? "--" : supplierNote}</p>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className='font-semibold'>Additional Details</h1>
                  <div>
                    <label htmlFor='referenceNumber' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Reference Number</label>
                    <input
                      id={`referenceNumber`}
                      {...register(`referenceNumber`)}
                      className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                      type="text"
                    />
                  </div>
                  <div>
                    <label htmlFor='supplierNote' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2 pt-[4px]">Note to supplier</label>
                    <textarea
                      id="supplierNote"
                      {...register("supplierNote")}
                      className="w-full p-3 border-2 border-[#ededed] outline-none focus:border-[#F4D3BA] focus:bg-white transition-colors duration-1000 rounded-md"
                      rows={5} // Set the number of rows for height adjustment
                    />
                  </div>
                </>
              )}
            </div>

            {/* Cost Summary */}
            <div className='flex-1 flex w-full flex-col justify-between gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
              <h1 className='font-semibold'>Cost summary</h1>

              {["ordered", "received", "canceled"].includes(purchaseOrderStatus) ? (
                <>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center gap-6'>
                      <h2 className='font-medium text-neutral-500'>Taxes</h2>
                      <p className='text-neutral-500'>৳ {totalTax.toFixed(2)}</p>
                    </div>
                    <div className='flex justify-between items-center gap-6'>
                      <h2 className='font-semibold'>Subtotal</h2>
                      <p className='text-neutral-950 font-semibold'>৳ {totalPrice.toFixed(2)}</p>
                    </div>
                    <p className='text-neutral-500'>{totalQuantity} items</p>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <h1 className='font-semibold'>Cost adjustments</h1>
                    <div className='flex justify-between items-center gap-6'>
                      <label className='flex w-full justify-start font-medium text-neutral-600'>+ Shipping</label>
                      <p className='flex items-center gap-1'><span>৳</span> {shipping}</p> {/* Display shipping value */}
                    </div>
                    <div className='flex justify-between items-center gap-6'>
                      <label className='flex w-full justify-start font-medium text-neutral-600'>- Discount</label>
                      <p className='flex items-center gap-1'><span>৳</span> {discount}</p> {/* Display discount value */}
                    </div>
                  </div>
                  <div className='flex justify-between items-center gap-6'>
                    <p className='text-neutral-950 font-semibold'>Total</p>
                    <p className='font-bold'>৳ {total}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center gap-6'>
                      <h2 className='font-medium text-neutral-500'>Taxes</h2>
                      <p className='text-neutral-500'>৳ {totalTax.toFixed(2)}</p>
                    </div>
                    <div className='flex justify-between items-center gap-6'>
                      <h2 className='font-semibold'>Subtotal</h2>
                      <p className='text-neutral-950 font-semibold'>৳ {totalPrice.toFixed(2)}</p>
                    </div>
                    <p className='text-neutral-500'>{totalQuantity}  items</p>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <h1 className='font-semibold'>Cost adjustments</h1>
                    <div className='flex justify-between items-center gap-6'>
                      <label htmlFor='shipping' className='flex w-full justify-start font-medium text-neutral-600'>+ Shipping</label>
                      <input
                        id='shipping'
                        {...register('shipping')}
                        className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        type="number"
                        onChange={handleShippingChange}  // Step 3: Update shipping state on change
                      />
                    </div>
                    <div className='flex justify-between items-center gap-6'>
                      <label htmlFor='discount' className='flex w-full justify-start font-medium text-neutral-600'>- Discount</label>
                      <input
                        id='discount'
                        {...register('discount')}
                        className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        type="number"
                        onChange={handleDiscountChange}  // Step 3: Update discount state on change
                      />
                    </div>
                  </div>
                  <div className='flex justify-between items-center gap-6'>
                    <p className='text-neutral-950 font-semibold'>Total</p>
                    <p className='font-bold'>৳ {total}</p>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Submit Button */}
          {purchaseOrderStatus === "pending" && isOwner === true && (
            <div className='flex justify-between w-full gap-6 my-4'>

              <button
                type='button'
                onClick={handleCancelClick}
                className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700"
              >
                Cancel Order
              </button>

              <button
                type='button'
                onClick={handleConfirmClick}
                className={`relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700`}
              >
                Confirm Order
              </button>
            </div>
          )}

          {purchaseOrderStatus === "ordered" && isAuthorized === true && (
            <div className='w-full flex justify-end my-4'>
              <Link href={`/product-hub/purchase-orders/receive-inventory/${id}`}
                className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700"
              >
                Receive inventory
              </Link>
            </div>
          )}

        </div>

      </form>

      <ExitConfirmationModalProduct
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        message={modalMessage}
        heading={headingMessage}
      />

      <PendingModalProduct
        isOpen={isModalOpenPending}
        onClose={() => setIsModalOpenPending(false)}
        onConfirm={revertStatusToPending}
      />

    </div>
  );
};

export default EditPurchaseOrderPage;