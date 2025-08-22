"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import useShipmentHandlers from '@/app/hooks/useShipmentHandlers';
import useShippingZones from '@/app/hooks/useShippingZones';
import { Checkbox } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const ThirdStepOfAddProduct = () => {

  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { handleSubmit } = useForm();
  const [shippingList, isShippingPending] = useShippingZones();
  const [shipmentHandlerList, isShipmentHandlerPending] = useShipmentHandlers();
  const [activeTab, setActiveTab] = useState('Inside Dhaka');
  const [tabSelections, setTabSelections] = useState({});

  const dhakaSuburbs = ["Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi", "Gazipur", "Narayanganj"];

  // Filtered shipping list for the active tab
  const filteredShippingList = shippingList?.filter((zone) => {
    if (activeTab === "Inside Dhaka") return zone?.selectedCity?.includes("Dhaka");
    if (activeTab === "Dhaka Suburbs") return zone?.selectedCity?.some((city) => dhakaSuburbs?.includes(city));
    if (activeTab === "Outside Dhaka") {
      // Exclude zones in Dhaka and Dhaka Suburbs
      return !zone?.selectedCity?.includes("Dhaka") &&
        !zone?.selectedCity?.some((city) => dhakaSuburbs?.includes(city));
    }
    return false;
  });

  useEffect(() => {
    // Check if the necessary data from the first two steps are available in localStorage
    const storedProductTitle = localStorage.getItem('productTitle');
    const storedProductBatchCode = localStorage.getItem('batchCode');
    const storedRegularPrice = localStorage.getItem('regularPrice');
    const storedUploadedImageUrls = JSON.parse(localStorage.getItem('uploadedImageUrls') || '[]');
    const storedCategory = localStorage.getItem('category');
    const storedSeason = JSON.parse(localStorage.getItem('season') || '[]');
    const storedSubCategories = JSON.parse(localStorage.getItem('subCategories') || '[]');
    const storedGroupOfSizes = JSON.parse(localStorage.getItem('groupOfSizes') || '[]');
    const storedAllSizes = JSON.parse(localStorage.getItem('allSizes') || '[]');
    const storedAvailableColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
    const storedNewArrival = localStorage.getItem('newArrival');
    const storedIsTrending = localStorage.getItem('trending');
    const storedTags = JSON.parse(localStorage.getItem('tags') || '[]');
    const storedProductId = localStorage.getItem('productId');
    const storedSizeGuideImageUrl = localStorage.getItem('sizeGuideImageUrl');

    // If any of these values are missing, redirect the user to the first step of the add-product process
    if (!storedProductTitle || !storedProductBatchCode || !storedRegularPrice || !storedUploadedImageUrls || !storedCategory || !storedSeason || !storedSubCategories || !storedGroupOfSizes || !storedAllSizes || !storedAvailableColors || !storedNewArrival || !storedTags || !storedProductId || !storedSizeGuideImageUrl || !storedIsTrending) {
      toast.error("Colors or sizes are missing. Please go back and select them.");
      router.push('/product-hub/products/add-product'); // Redirect to the first step
      return;
    }
  }, [router]);

  useEffect(() => {
    const initializeTabSelections = () => {
      const dhakaSuburb = ["Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi"];

      if (!tabSelections["Outside Dhaka"]) {
        const filteredList = shippingList?.filter((zone) => {
          return (
            !zone?.selectedCity?.includes("Dhaka") &&
            !zone?.selectedCity?.some((city) => dhakaSuburb?.includes(city))
          );
        });

        setTabSelections((prev) => ({
          ...prev,
          ["Outside Dhaka"]: filteredList?.map((item) => ({ ...item, selected: true })) || [],
        }));
      }
    };

    if (shippingList?.length) {
      initializeTabSelections();
    }
  }, [shippingList, tabSelections]);

  // Unified selection list from all tabs
  const selectedShipmentHandler = Object.values(tabSelections).flat();

  // Toggle selection for an individual item
  const toggleCardSelection = (shipping) => {
    setTabSelections((prev) => {
      const currentTabSelections = prev[activeTab] || [];
      const isSelected = currentTabSelections.some(
        (item) => item.shippingZone === shipping.shippingZone
      );
      const updatedTabSelections = isSelected
        ? currentTabSelections.filter(
          (item) => item.shippingZone !== shipping.shippingZone
        )
        : [...currentTabSelections, shipping];
      return { ...prev, [activeTab]: updatedTabSelections };
    });
  };

  // Handle "Select All" for the active tab
  const toggleSelectAll = () => {
    setTabSelections((prev) => {
      const currentTabSelections = prev[activeTab] || [];
      const allSelected = currentTabSelections.length === filteredShippingList.length;
      return {
        ...prev,
        [activeTab]: allSelected ? [] : [...filteredShippingList],
      };
    });
  };

  const validateSelections = () => {
    const tabs = ["Inside Dhaka", "Dhaka Suburbs", "Outside Dhaka"];

    // Loop through each tab to check if there are selections
    for (const tab of tabs) {
      // Check if tabSelections for the current tab exists and has items selected
      if (!tabSelections[tab] || tabSelections[tab].length === 0) {
        toast.error(`Select at least one item in the ${tab}`);
        return false;
      }
    }

    return true;
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const onSubmit = async () => {
    if (!validateSelections()) return;

    const storedFormattedDate = localStorage.getItem("formattedDate")
    const storedProductTitle = localStorage.getItem('productTitle');
    const storedProductWeight = localStorage.getItem('weight');
    const storedProductBatchCode = localStorage.getItem('batchCode');
    const storedRegularPrice = localStorage.getItem('regularPrice');
    const storedUploadedImageUrl = localStorage.getItem('uploadedImageUrl');
    const storedRestOfOutfit = JSON.parse(localStorage.getItem('restOfOutfit') || '[]');
    const storedDiscountType = localStorage.getItem('discountType');
    const storedDiscountValue = localStorage.getItem('discountValue');
    const storedProductDetails = localStorage.getItem('productDetails');
    const storedMaterialCare = localStorage.getItem('materialCare');
    const storedSizeFit = localStorage.getItem('sizeFit');
    const storedCategory = localStorage.getItem('category');
    const storedSeason = JSON.parse(localStorage.getItem('season') || '[]');
    const storedSubCategories = JSON.parse(localStorage.getItem('subCategories') || '[]');
    const storedGroupOfSizes = JSON.parse(localStorage.getItem('groupOfSizes') || '[]');
    const storedAllSizes = JSON.parse(localStorage.getItem('allSizes') || '[]');
    const storedAvailableColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
    const storedNewArrival = localStorage.getItem('newArrival');
    const storedIsTrending = localStorage.getItem('trending');
    const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const storedTags = JSON.parse(localStorage.getItem('tags') || '[]');
    const storedVariants = JSON.parse(localStorage.getItem('productVariants') || '[]');
    const storedProductId = localStorage.getItem('productId');
    const storedSizeGuideImageUrl = localStorage.getItem('sizeGuideImageUrl');
    const storedShowInventory = localStorage.getItem('showInventory');
    const selectedShippingZoneIds = selectedShipmentHandler.map(zone => zone._id);

    const wholeProductData = {
      publishDate: storedFormattedDate,
      productTitle: storedProductTitle,
      weight: storedProductWeight,
      batchCode: storedProductBatchCode,
      regularPrice: storedRegularPrice,
      thumbnailImageUrl: storedUploadedImageUrl,
      discountType: storedDiscountType,
      discountValue: storedDiscountValue,
      productDetails: storedProductDetails,
      materialCare: storedMaterialCare,
      sizeFit: storedSizeFit,
      category: storedCategory,
      subCategories: storedSubCategories,
      groupOfSizes: storedGroupOfSizes,
      allSizes: storedAllSizes,
      availableColors: storedAvailableColors,
      newArrival: storedNewArrival,
      trending: storedIsTrending,
      vendors: storedVendors,
      tags: storedTags,
      season: storedSeason,
      productVariants: storedVariants,
      selectedShippingZoneIds: selectedShippingZoneIds,
      productId: storedProductId,
      status: "active",
      sizeGuideImageUrl: storedSizeGuideImageUrl,
      restOfOutfit: storedRestOfOutfit,
      isInventoryShown: storedShowInventory,
    }

    try {
      // Post the entire selectedShipmentHandler array, which contains full shipping details
      const response = await axiosSecure.post('/addProduct', wholeProductData);

      if (response?.data?.insertedId) {
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
                    Product Published!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    This Product is successfully added!
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
        localStorage.removeItem('productTitle');
        localStorage.removeItem('batchCode');
        localStorage.removeItem('weight');
        localStorage.removeItem('regularPrice');
        localStorage.removeItem('uploadedImageUrl');
        localStorage.removeItem('discountType');
        localStorage.removeItem('discountValue');
        localStorage.removeItem('productDetails');
        localStorage.removeItem('materialCare');
        localStorage.removeItem('sizeFit');
        localStorage.removeItem('category');
        JSON.parse(localStorage.removeItem('season') || '[]');
        JSON.parse(localStorage.removeItem('subCategories') || '[]');
        JSON.parse(localStorage.removeItem('groupOfSizes') || '[]');
        JSON.parse(localStorage.removeItem('allSizes') || '[]');
        JSON.parse(localStorage.removeItem('availableColors') || '[]');
        localStorage.removeItem('newArrival');
        localStorage.removeItem('trending');
        JSON.parse(localStorage.removeItem('vendors') || '[]');
        JSON.parse(localStorage.removeItem('restOfOutfit') || '[]');
        JSON.parse(localStorage.removeItem('tags') || '[]');
        JSON.parse(localStorage.removeItem('productVariants') || '[]');
        localStorage.removeItem('formattedDate');
        localStorage.removeItem('productId');
        localStorage.removeItem('sizeGuideImageUrl');
        router.push("/product-hub/products/existing-products");
      }
    } catch (error) {
      console.error("Error response:", error.response || error.message);
      toast.error('Failed to add Product Details. Please try again!');
    }
  };

  if (isShippingPending || isShipmentHandlerPending) {
    return <Loading />
  };

  return (
    <div className='min-h-[calc(100vh-60px)] bg-gray-50 relative px-6'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat xl:left-[15%] 2xl:left-[30%] bg-[length:1600px_900px] -top-[90px]'
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
        className='absolute inset-0 z-0 top-8 xl:top-12 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[40%] 2xl:left-[41%] bg-no-repeat'
      />

      <div className='mx-auto py-3 md:py-6 px-6 sticky top-0 z-10 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>SELECT SHIPPING DETAILS</h3>
          <Link
            className="flex items-center gap-2 text-[10px] md:text-base justify-end w-full"
            href="/product-hub/products"
          >
            <span className="border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2">
              <FaArrowLeft />
            </span>
            Go Back
          </Link>
        </div>

        <div className='flex flex-wrap items-center gap-3 bg-gray-50 mt-4'>

          <button
            className={`relative text-sm py-1 transition-all duration-300
${activeTab === 'Inside Dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab === 'Inside Dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
            onClick={() => handleTabChange("Inside Dhaka")}
          >
            Inside Dhaka
          </button>

          <button
            className={`relative text-sm py-1 transition-all duration-300
${activeTab === 'Dhaka Suburbs' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab === 'Dhaka Suburbs' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
            onClick={() => handleTabChange("Dhaka Suburbs")}
          >
            Dhaka Suburbs
          </button>

          <button
            className={`relative text-sm py-1 transition-all duration-300
${activeTab === 'Outside Dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab === 'Outside Dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
            onClick={() => handleTabChange("Outside Dhaka")}
          >
            Outside Dhaka
          </button>

        </div>

      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='mx-auto min-h-[80vh] flex flex-col justify-between relative'>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white">

            <thead>
              <tr className='rounded-lg bg-gray-50'>
                <th className="px-2 py-1 md:px-4 md:py-2 border-b border-gray-300">
                  <Checkbox
                    isSelected={filteredShippingList?.length > 0 && (tabSelections[activeTab]?.length === filteredShippingList?.length)}
                    onChange={toggleSelectAll}
                    color="success"
                    size="md"
                  />
                </th>
                <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Zone</th>
                <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipment Handlers</th>
                <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Charges</th>
                <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Hours</th>
              </tr>
            </thead>

            <tbody>
              {filteredShippingList?.map((shipping, index) => {
                const isSelected = selectedShipmentHandler?.some(
                  (handler) => handler?.shippingZone === shipping?.shippingZone
                );

                const handler = shipmentHandlerList?.find(h => h?._id === shipping?.selectedShipmentHandlerId);

                // Derive delivery types from shippingCharges keys (or shippingDurations keys)
                const deliveryTypes = shipping?.shippingCharges ? Object.keys(shipping?.shippingCharges) : [];

                return (
                  <tr key={index}
                    className={`cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                    {/* Checkbox for selecting a row */}
                    <td className="text-center">
                      <Checkbox
                        isSelected={isSelected}
                        onChange={() => toggleCardSelection(shipping)}
                        color="success"
                        size='md'
                      />
                    </td>

                    {/* Shipping Zone Title */}
                    <td className="text-xs md:text-base text-center font-bold text-gray-900">
                      {shipping?.shippingZone}
                    </td>

                    {/* Shipment Handlers */}
                    <td className="px-2 py-1 md:px-4 md:py-2">
                      <div className="flex items-center justify-center md:gap-4">
                        <div className="p-4 rounded-lg flex flex-col items-center justify-center h-40 w-40">
                          {handler?.imageUrl && (
                            <Image
                              src={handler?.imageUrl}
                              alt="shipping"
                              width={100}
                              height={100}
                              className="mb-2 object-contain h-32 w-32"
                            />
                          )}
                        </div>
                      </div>
                    </td>

                    <td className='text-center font-bold text-gray-900 text-xs md:text-base'>{deliveryTypes?.length > 0 ? (
                      deliveryTypes?.map((type, idx) => (
                        <div key={idx}>
                          {type}: ৳ {shipping?.shippingCharges[type] ?? "—"}
                        </div>
                      ))
                    ) : (
                      "—"
                    )}
                    </td>

                    <td className='text-center font-bold text-gray-900 text-xs md:text-base'>{deliveryTypes?.length > 0 ? (
                      deliveryTypes?.map((type, idx) => (
                        <div key={idx}>
                          {type}: {shipping?.shippingDurations?.[type] ?? "—"} {type === "EXPRESS" ? "hours" : "days"}
                        </div>
                      ))
                    ) : (
                      "—"
                    )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        <div className='flex justify-between px-6 2xl:px-0 py-6'>
          <Link href='/product-hub/products/add-product-2' className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'>
            <FaArrowLeft /> Previous Step
          </Link>

          <div className='flex items-center gap-6'>

            <button type='submit' className={`relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700`}>
              Publish <MdOutlineFileUpload size={20} />
            </button>
          </div>

        </div>
      </form>

    </div>
  );
};

export default ThirdStepOfAddProduct;