"use client";
import { getProductTitleById } from '@/app/components/product/productTitle/getProductTitleById';
import Progressbar from '@/app/components/product/progress/Progressbar';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const EditReceiveInventory = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { handleSubmit, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [purchaseOrderVariants, setPurchaseOrderVariants] = useState([]);
  const [acceptError, setAcceptError] = useState(false);
  const [productList, isProductPending] = useProductsInformation();
  const [locationName, setLocationName] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchPurchaseOrderData = async () => {
      try {
        const response = await axiosSecure.get(`/getSinglePurchaseOrder/${id}`);
        const order = response?.data;

        setSelectedProducts(order?.selectedProducts);
        setPurchaseOrderVariants(order?.purchaseOrderVariants);
        setPurchaseOrderNumber(order?.purchaseOrderNumber);
        setLocationName(order?.destination?.locationName);

        setIsLoading(false);
      } catch (err) {
        // console.error(err); // Log error to the console for debugging
        // toast.error("Failed to fetch purchase order details!");
        router.push('/product-hub/purchase-orders');
      }
    };

    fetchPurchaseOrderData();
  }, [id, axiosSecure, setValue, session?.user?.accessToken, status, router]);

  const handleAddAllAccept = (index) => {
    setPurchaseOrderVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      updatedVariants[index].accept = updatedVariants[index].quantity; // Set accept to total quantity
      updatedVariants[index].reject = 0; // Reset reject to 0
      return updatedVariants;
    });
  };

  const handleAddAllReject = (index) => {
    setPurchaseOrderVariants(prevVariants => {
      const updatedVariants = [...prevVariants];
      updatedVariants[index].reject = updatedVariants[index].quantity; // Set reject to total quantity
      updatedVariants[index].accept = 0; // Reset accept to 0
      return updatedVariants;
    });
  };

  const handleAcceptChange = (index, value) => {
    const quantity = purchaseOrderVariants[index]?.quantity || 0;
    let accept = parseInt(value) || 0;

    if (accept > quantity) accept = quantity;
    const reject = quantity - accept;

    setPurchaseOrderVariants(prev => {
      const updated = [...prev];
      updated[index].accept = accept;
      updated[index].reject = reject;
      return updated;
    });
  };

  const handleRejectChange = (index, value) => {
    const quantity = purchaseOrderVariants[index]?.quantity || 0;
    let reject = parseInt(value) || 0;

    if (reject > quantity) reject = quantity;
    const accept = quantity - reject;

    setPurchaseOrderVariants(prev => {
      const updated = [...prev];
      updated[index].reject = reject;
      updated[index].accept = accept;
      return updated;
    });
  };

  const onSubmit = async () => {

    try {

      // Check if any accept value is less than or equal to 0 or an empty string
      const invalidVariantsForZero = purchaseOrderVariants.filter(variant =>
        variant.accept <= 0
      );

      // Check if any accept value is less than or equal to 0 or an empty string
      const invalidVariants = purchaseOrderVariants.filter(variant =>
        variant.accept === undefined
      );

      if (invalidVariantsForZero.length > 0) {
        // Handle the error: show an error message or mark fields as invalid
        toast.error('Accept value must be greater than 0');
        return; // Stop the submission
      }

      if (invalidVariants.length > 0) {
        // Handle the error: show an error message or mark fields as invalid
        setAcceptError(true);
        return; // Stop the submission
      }
      setAcceptError(false);

      // Instead of multiple calls:
      const updateResponses = await axiosSecure.patch("/receiveStock", {
        variants: purchaseOrderVariants
          .filter(variant => variant.accept > 0) // only process valid ones
          .map(variant => ({
            productId: variant.productId,
            colorCode: variant.colorCode,
            size: variant.size,
            location: locationName,
            accept: parseFloat(variant.accept),
          })),
      });

      const { results, message } = updateResponses.data;

      // 5️⃣ Process the responses
      const successfulUpdates = results?.filter(update => update.success);
      const failedUpdates = results?.filter(update => !update.success);

      if (failedUpdates.length > 0) {
        const errorMessages = failedUpdates.map(u => `${u?.productId}: ${u?.error}`).join("\n");
        toast.error(`Some variants failed to update:\n${errorMessages}`);
        return; // Stop here, don't update purchase order
      }

      const receivedOrderData = {
        purchaseOrderVariants: purchaseOrderVariants?.map(variant => ({
          productId: variant.productId,
          quantity: parseFloat(variant.quantity),
          cost: parseFloat(variant.cost),
          tax: parseFloat(variant.tax) || 0,
          size: variant?.size,
          colorCode: variant.colorCode,  // Include the color code
          colorName: variant.colorName,   // Include the color name
          accept: parseFloat(variant?.accept) || 0,
          reject: parseFloat(variant?.reject) || 0
        })),
        status: 'received'
      };

      // API call for updating purchase order
      const response1 = await axiosSecure.put(`/editPurchaseOrder/${id}`, receivedOrderData);

      // Show single toast message based on the update results
      if (response1.data.modifiedCount > 0) {
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
                    Purchase order received!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {successfulUpdates.length} product(s) successfully updated!
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

        // Redirect after toast
        router.push('/product-hub/purchase-orders');
      } else {
        toast.error("Purchase order update failed or no changes detected.", {
          position: "bottom-right",
          duration: 5000,
        });
      }

    } catch (err) {
      console.error("Error in submitting purchase order:", err);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to receive purchase order",
        {
          position: "bottom-right",
          duration: 5000,
        }
      );
    }

  };

  if (isLoading || isProductPending || status === "loading") {
    return <Loading />
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex flex-col w-full'>
            <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-600'>Receive items</h3>
            <span className='text-neutral-500 text-sm'>#{purchaseOrderNumber}</span>
          </div>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={`/product-hub/purchase-orders/${id}`}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">

        <div className="max-w-screen-xl mx-auto overflow-x-auto rounded-lg custom-scrollbar relative pt-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b">
                  Products
                </th>
                <th className="text-[10px] md:text-xs text-center font-bold p-2 xl:p-3 text-neutral-950 border-b">
                  Available Quantity
                </th>
                <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                  Accept
                </th>
                <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                  Reject
                </th>
                <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-center">
                  Received
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {selectedProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="text-sm p-3 text-neutral-500 text-center cursor-pointer flex flex-col lg:flex-row items-center gap-3">
                    <div>
                      <Image className='h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5' src={product?.imageUrl} alt={product?.productId} height={600} width={600} />
                    </div>
                    <div className='flex flex-col items-start justify-start gap-1'>
                      <p className='font-bold text-blue-700 text-start'>
                        {getProductTitleById(product?.productId, productList)}
                      </p>
                      <p className='font-medium'>{product?.size}</p>
                      <span className='flex items-center gap-2'>
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                    {purchaseOrderVariants[index]?.quantity}
                  </td>
                  <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                    <div className='flex items-center gap-3'>
                      <input
                        type="number"
                        min="0"
                        max={purchaseOrderVariants[index]?.quantity}
                        step="1"
                        className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        value={purchaseOrderVariants[index]?.accept || ''} // Set value to empty string when 0
                        onChange={(e) => handleAcceptChange(index, e.target.value)}
                      />
                      <button
                        type="button" // Prevent form submission
                        onClick={() => handleAddAllAccept(index)}
                        className="bg-white drop-shadow px-4 py-2 rounded hover:bg-[#bdf6b4] text-neutral-700"
                      >
                        All
                      </button>
                    </div>
                    {acceptError && <p className='text-left pt-2 text-red-500 font-semibold text-xs'>This field is required</p>}
                  </td>
                  <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                    <div className='flex items-center gap-3'>
                      <input
                        type="number"
                        min="0"
                        max={purchaseOrderVariants[index]?.quantity}
                        step="1"
                        className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        value={purchaseOrderVariants[index]?.reject || ''} // Set value to empty string when 0
                        onChange={(e) => handleRejectChange(index, e.target.value)}
                      />
                      <button
                        type="button" // Prevent form submission
                        onClick={() => handleAddAllReject(index)}
                        className="bg-white drop-shadow text-neutral-700 px-4 py-2 rounded hover:bg-red-600 hover:text-white"
                      >
                        All
                      </button>
                    </div>
                  </td>
                  <td className="text-sm p-3 text-neutral-500 text-center font-semibold">
                    <Progressbar
                      accepted={purchaseOrderVariants[index]?.accept || 0}
                      rejected={purchaseOrderVariants[index]?.reject || 0}
                      total={purchaseOrderVariants[index]?.quantity}
                    />
                    <div className="mt-1">
                      {purchaseOrderVariants[index]?.accept || 0} of {purchaseOrderVariants[index]?.quantity}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex justify-end items-center gap-6 w-full my-4 max-w-screen-xl mx-auto'>

          <button
            type='submit'
            className={`relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700`}>
            Accept
          </button>

        </div>
      </form>

    </div>
  );
};

export default EditReceiveInventory;