"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/contexts/auth';
import Progressbar from '@/app/components/product/progress/Progressbar';
import ExitConfirmationModalProduct from '@/app/components/product/modal/ExitConfirmationModalProduct';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import HeadingText from '@/app/components/product/headingText/HeadingText';
import { getProductTitleById } from '@/app/components/product/productTitle/getProductTitleById';
import useProductsInformation from '@/app/hooks/useProductsInformation';

const TransferOrderPDFButton = dynamic(() => import("@/app/components/product/pdf/TransferOrderPDFButton"), { ssr: false });

const currentModule = "Product Hub";

const EditTransferOrder = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productList, isProductPending] = useProductsInformation();
  const [transferOrderVariants, setTransferOrderVariants] = useState([]);
  const [transferOrderStatus, setTransferOrderStatus] = useState("");
  const [transferOrderNumber, setTransferOrderNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");  // Initial value for discount
  const [supplierNote, setSupplierNote] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [headingMessage, setHeadingMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
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

  // Memoized function to fetch transfer order data
  const fetchTransferOrderData = useCallback(async () => {
    try {
      if (!id || typeof window === "undefined") return;

      if (status !== "authenticated" || !session?.user?.accessToken) return;

      const response = await axiosSecure.get(`/getSingleTransferOrder/${id}`);
      const order = response?.data;
      const fetchedEstimatedArrival = formatDateForInput(order?.estimatedArrival);
      setEstimatedArrival(fetchedEstimatedArrival);
      setSelectedOrigin(order?.origin);
      setSelectedDestination(order?.destination);
      setSelectedProducts(order?.selectedProducts);
      setTransferOrderVariants(order?.transferOrderVariants);
      setTransferOrderStatus(order?.status);
      setTransferOrderNumber(order?.transferOrderNumber);
      setReferenceNumber(order?.referenceNumber);
      setSupplierNote(order?.supplierNote);
      setShippingCarrier(order?.shippingCarrier);
      setTrackingNumber(order?.trackingNumber);

      setIsLoading(false);
    } catch (err) {
      // console.error(err);
      // toast.error("Failed to fetch transfer order details!");
      router.push("/product-hub/transfers")
    }
  }, [id, axiosSecure, session?.user?.accessToken, status, router]);

  // Initial load useEffect
  useEffect(() => {
    fetchTransferOrderData();
  }, [fetchTransferOrderData]);

  const totalAcceptRejectValues = useMemo(() =>
    transferOrderVariants?.reduce(
      ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
        totalQuantity: totalQuantity + quantity,
        totalAccept: totalAccept + accept,
        totalReject: totalReject + reject,
      }),
      { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
    ),
    [transferOrderVariants]
  );

  // delete purchase order
  const handleDeleteTransferOrder = async (id) => {
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
          const res = await axiosSecure.delete(`/deleteTransferOrder/${id}`);
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
                        Transfer order removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Transfer order has been deleted successfully!
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
            router.push("/product-hub/transfers")
          }
        } catch (error) {
          toast.error('Failed to delete season. Please try again.');
        }
      }
    });
  }

  const handleCancelClick = () => {
    setModalMessage("Once this transfer order is marked as canceled, you will no longer be able to track or update inventory transfers between locations. This transfer order cannot be reverted to pending status.");
    setHeadingMessage(("canceled"));
    setSelectedStatus("canceled");
    setIsModalOpen(true);
  };

  const handleReceiveTransferClick = () => {
    router.push(`/product-hub/transfers/receive-transfer/${id}`);
  }

  const onSubmit = async (data) => {

    data.status = selectedStatus;

    try {
      const updatedTransferOrderData = {
        origin: selectedOrigin,
        destination: selectedDestination,
        transferOrderVariants,
        transferOrderNumber,
        selectedProducts,
        estimatedArrival,
        referenceNumber,
        supplierNote,
        shippingCarrier,
        trackingNumber,
        status: data?.status,
      }

      const res = await axiosSecure.put(`/editTransferOrder/${id}`, updatedTransferOrderData);
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
                    Transfer order canceled!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Purchase order has been canceled successfully!
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
        fetchTransferOrderData();
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
        // If successful, you may handle any additional actions here
      })
      .catch((error) => {
        // If there's an error in submission, open the modal again if needed
        setIsModalOpen(true);
        console.error("Submission error:", error);
      });
  };

  if (isLoading || isUserLoading || status === "loading" || isProductPending) {
    return <Loading />;
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex flex-wrap md:flex-nowrap items-center justify-between w-full'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700l'>#{transferOrderNumber} <span
            className={`px-3 py-1 rounded-full
      ${transferOrderStatus === "pending" ? "bg-yellow-100 text-yellow-600"
                : transferOrderStatus === "received" ? "bg-green-100 text-green-600"
                  : transferOrderStatus === "canceled" ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"}`}
          >
            {transferOrderStatus === "pending" ? "Pending"
              : transferOrderStatus === "received" ? "Received"
                : transferOrderStatus === "canceled" ? "Canceled"
                  : "Unknown"}
          </span></h3>
          <div className='flex justify-between md:justify-end gap-4 items-center w-full'>
            <div className="flex gap-4 items-center">

              {isOwner &&
                <button onClick={() => handleDeleteTransferOrder(id)}
                  class="group relative inline-flex items-center justify-center w-[40px] h-[40px] bg-[#D2016E] text-white rounded-full shadow-lg transform scale-100 transition-transform duration-300"
                >
                  <svg
                    width="25px"
                    height="25px"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="rotate-0 transition ease-out duration-300 scale-100 group-hover:-rotate-45 group-hover:scale-75"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      stroke-width="2"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                </button>
              }

              <TransferOrderPDFButton
                transferOrderNumber={transferOrderNumber}
                transferOrderStatus={transferOrderStatus}
                selectedOrigin={selectedOrigin}
                selectedDestination={selectedDestination}
                estimatedArrival={estimatedArrival}
                transferOrderVariants={transferOrderVariants}
                referenceNumber={referenceNumber}
                supplierNote={supplierNote}
                trackingNumber={trackingNumber}
                shippingCarrier={shippingCarrier}
                selectedProducts={selectedProducts.map((product) => ({
                  ...product,
                  productTitle: getProductTitleById(product?.productId, productList),
                }))}
              />
            </div>
            <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end' href={"/product-hub/transfers"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto py-6 flex flex-col gap-4'>

          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <div className='flex-1 space-y-3'>
              <h1 className='font-medium'>Origin</h1>
              {selectedOrigin && (
                <div className='space-y-3'>
                  <p className='font-semibold'>{selectedOrigin?.locationName}</p>
                  <p className="text-neutral-500 font-medium">
                    {selectedOrigin?.locationAddress}, {selectedOrigin?.cityName}, {selectedOrigin?.postalCode}
                  </p>
                </div>
              )}
            </div>

            <div className='flex-1 space-y-3'>
              <h1 className='font-medium'>Destination</h1>
              {selectedDestination && (
                <div className='space-y-3'>
                  <p className='font-semibold'>{selectedDestination?.locationName}</p>
                  <p className="text-neutral-500 font-medium">
                    {selectedDestination?.locationAddress}, {selectedDestination?.cityName}, {selectedDestination?.postalCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <div className='flex justify-between items-center gap-6'>
              <h1 className='flex-1 font-bold text-lg'>
                <HeadingText orderStatus={transferOrderStatus} />
              </h1>
              <div className='flex flex-col flex-1'>
                <Progressbar
                  accepted={totalAcceptRejectValues.totalAccept}
                  rejected={totalAcceptRejectValues.totalReject}
                  total={totalAcceptRejectValues.totalQuantity}
                />
                <div className="mt-1">
                  {totalAcceptRejectValues.totalAccept} of {totalAcceptRejectValues.totalQuantity}
                </div>
              </div>
            </div>

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
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-right">
                        Received
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts?.map((product, index) => {

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="text-sm p-3 text-neutral-500 text-center cursor-pointer flex flex-col lg:flex-row items-center gap-3">
                            <div>
                              <Image className='h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5' src={product?.imageUrl} alt={product?.productId} height={6000} width={6000} />
                            </div>
                            <div className='flex flex-col items-start justify-start gap-1'>
                              <p className='font-bold text-blue-700 text-start'>{getProductTitleById(product?.productId, productList)}</p>
                              <p className='font-medium'>{product?.size}</p>
                              <span className='flex items-center gap-2'>
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-sm p-3 text-neutral-500 font-semibold">
                            <div className='flex flex-col justify-center items-end'>
                              <div className='w-full'>
                                <Progressbar
                                  accepted={transferOrderVariants[index]?.accept || 0}
                                  rejected={transferOrderVariants[index]?.reject || 0}
                                  total={transferOrderVariants[index]?.quantity}
                                />
                                <div className="mt-1">
                                  {transferOrderVariants[index]?.accept || 0} of {transferOrderVariants[index]?.quantity}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
            {selectedProducts?.length > 0 && <p className='px-4 pt-4 text-neutral-500 font-medium'>{selectedProducts?.length} variants on transfer order</p>}

          </div>

          <div className='flex flex-col lg:flex-row w-full justify-between items-start gap-6'>

            <div className='w-full flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
              <h1 className='font-semibold'>Shipment Details</h1>

              <div className='flex-1'>
                <label htmlFor='estimatedArrival' className='flex justify-start font-medium text-neutral-800 pb-2'>Estimated Arrival</label>
                <p className='text-neutral-500'>{estimatedArrival}</p>
              </div>
              <div>
                <label htmlFor='shippingCarrier' className='flex justify-start font-medium text-neutral-500 pb-2'>Shipping carrier</label>
                <p className='text-neutral-500'>{shippingCarrier === "" ? "--" : shippingCarrier}</p>
              </div>
              <div>
                <label htmlFor='trackingNumber' className='flex justify-start font-medium text-neutral-500 pb-2'>Tracking Number</label>
                <p className='text-neutral-500'>{trackingNumber === "" ? "--" : trackingNumber}</p>
              </div>

            </div>

            <div className='w-full flex flex-col justify-between gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
              <h1 className='font-semibold'>Additional Details</h1>
              <div>
                <label htmlFor='referenceNumber' className='flex justify-start font-medium text-neutral-500 pb-2'>Reference Number</label>
                <p className='text-neutral-500'>{referenceNumber === "" ? "--" : referenceNumber}</p>
              </div>
              <div>
                <label htmlFor='supplierNote' className='flex justify-start font-medium text-neutral-500 pb-2'>Note to supplier</label>
                <p className='text-neutral-500'>{supplierNote === "" ? "--" : supplierNote}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {transferOrderStatus === "pending" && isAuthorized === true && <div className={`flex ${isOwner === true ? "justify-between" : "justify-end"} items-center`}>

            {isOwner &&
              <button
                type='button'
                onClick={handleCancelClick}
                className="mt-4 mb-8 relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700"
              >
                Cancel transfer
              </button>
            }

            <button
              type='button'
              onClick={handleReceiveTransferClick}
              className={`mt-4 mb-8 relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700`}
            >
              Receive transfer
            </button>

          </div>}
        </div>

      </form>

      <ExitConfirmationModalProduct
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        message={modalMessage}
        heading={headingMessage}
      />

    </div>
  );
};

export default EditTransferOrder;