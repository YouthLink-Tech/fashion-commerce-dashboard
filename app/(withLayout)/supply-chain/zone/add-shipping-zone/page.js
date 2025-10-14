"use client";
import { cities } from '@/app/data/cities';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAuth } from '@/app/contexts/auth';
import useShipmentHandlers from '@/app/hooks/useShipmentHandlers';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaPlusCircle } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineFileUpload } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';

const currentModule = "Supply Chain";

const AddShippingZone = () => {
  const hasLoaded = useRef(false);
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [selectedShipmentHandlerId, setSelectedShipmentHandlerId] = useState("");
  const [selectedShipmentHandler, setSelectedShipmentHandler] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [shipmentHandlerList, isShipmentHandlerPending, refetch] = useShipmentHandlers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityError, setCityError] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const suggestionsRefCity = useRef(null);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isOwner = role === "Owner";
  const { data: session, status } = useSession();

  const { register, handleSubmit, resetField, watch, setValue, formState: { errors } } = useForm();
  const shippingZone = watch("shippingZone");

  useEffect(() => {
    if (!selectedShipmentHandlerId || typeof window === "undefined") return; // Avoid fetching without an ID

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchShipmentHandlerData = async () => {
      try {
        const { data } = await axiosSecure.get(`/api/shipment-handler/single/${selectedShipmentHandlerId}`);
        setSelectedShipmentHandler(data); // Store fetched data in state
      } catch (error) {
        console.error(error);
      }
    };

    fetchShipmentHandlerData();
  }, [selectedShipmentHandlerId, session?.user?.accessToken, status, axiosSecure]); // Re-fetch when selectedId changes

  // Save & remove instantly when shippingZone changes
  useEffect(() => {
    if (!hasLoaded.current) return;

    if (shippingZone && shippingZone.trim() !== "") {
      localStorage.setItem("shippingZone", shippingZone);
    } else {
      localStorage.removeItem("shippingZone");
    }
  }, [shippingZone]);

  // Save instantly when selectedCities changes
  useEffect(() => {
    if (!hasLoaded.current) return; // skip first render
    if (selectedCities.length > 0) {
      localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
    } else {
      localStorage.removeItem("selectedCities");
    }
  }, [selectedCities]);

  // Load from localStorage once
  useEffect(() => {
    const storedZone = localStorage.getItem("shippingZone");
    const storedCities = localStorage.getItem("selectedCities");

    if (storedZone) {
      setValue("shippingZone", storedZone);
    }
    if (storedCities) {
      setSelectedCities(JSON.parse(storedCities));
    }

    hasLoaded.current = true; // allow save effects to run after first load
  }, [setValue]);

  // Filter cities based on the search term and exclude selected cities
  const filteredCities = cities.filter(
    (city) =>
      city.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedCities.includes(city)
  );

  // Handle city selection
  const handleCitySelect = (city) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
    setSearchTerm(""); // Clear input
    setShowCitySuggestions(false); // Close suggestions
    setCityError(false);
  };

  // Remove selected city
  const handleCityRemove = (index) => {
    const updatedCities = [...selectedCities];
    updatedCities.splice(index, 1);
    setSelectedCities(updatedCities);
  };

  // Select all cities
  const handleSelectAll = () => {
    setSelectedCities(cities);
    setCityError(false);
  };

  // Unselect all cities
  const handleUnselectAll = () => {
    setSelectedCities([]);
    setCityError(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowCitySuggestions(true);
  };

  // Function to handle selection (only one allowed)
  const toggleLogoSelection = (shipmentHandlerId) => {
    // If the same handler is clicked again, deselect it
    if (selectedShipmentHandlerId?._id === shipmentHandlerId) {
      setSelectedShipmentHandlerId(null);
    } else {
      // Replace the selection with the newly clicked handler
      setSelectedShipmentHandlerId(shipmentHandlerId);
      setSizeError(false); // Clear error when a handler is selected
    }
  };

  const handleEditShipmentHandler = (e, id) => {
    e.preventDefault();
    router.push(`/supply-chain/zone/add-shipment-handler/${id}`)
  }

  const handleDeleteShipmentHandler = async (e, id) => {
    e.preventDefault(); // Prevent form submission
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
          const res = await axiosSecure.delete(`/api/shipment-handler/delete/${id}`);
          if (res?.data?.deletedCount) {
            refetch();
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
                        Shipment Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Shipment Handler deleted successfully!
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
          toast.error('Failed to delete this shipment handler. Please try again!');
        }
      }
    });
  };

  // Reset shipping charge fields when the selected shipment handler changes
  useEffect(() => {
    if (selectedShipmentHandler) {
      if (selectedShipmentHandler.deliveryType.includes('STANDARD')) {
        resetField('shippingChargeSTANDARD');
      }
      if (selectedShipmentHandler.deliveryType.includes('EXPRESS')) {
        resetField('shippingChargeEXPRESS');
      }
    }
  }, [selectedShipmentHandler, resetField]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const { shippingZone } = data;

    // Check if cities and shipping handlers are selected
    let hasError = false;

    if (!selectedShipmentHandler && !selectedShipmentHandlerId) {
      setSizeError(true);
      hasError = true;
    }

    if (selectedCities.length === 0) {
      setCityError(true);
      hasError = true;
    }

    // If there are errors, prevent submission
    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    // Prepare shipping charges and times objects
    let shippingCharges = {};
    let shippingDurations = {};

    // Handle single delivery type
    if (selectedShipmentHandler?.deliveryType.length === 1) {
      const deliveryType = selectedShipmentHandler.deliveryType[0];
      shippingCharges[deliveryType] = data.shippingCharge;
      shippingDurations[deliveryType] = data.shippingTime;
    }

    // Handle multiple delivery types (STANDARD and EXPRESS)
    if (selectedShipmentHandler?.deliveryType.length === 2) {
      if (selectedShipmentHandler.deliveryType.includes('STANDARD')) {
        shippingCharges['STANDARD'] = data.shippingChargeStandard;
        shippingDurations['STANDARD'] = data.shippingDaysStandard;
      }
      if (selectedShipmentHandler.deliveryType.includes('EXPRESS')) {
        shippingCharges['EXPRESS'] = data.shippingChargeExpress;
        shippingDurations['EXPRESS'] = data.shippingHourExpress;
      }
    }

    const shippingData = {
      shippingZone,
      selectedShipmentHandlerId,
      shippingCharges,
      shippingDurations,
      selectedCity: selectedCities
    };

    try {
      const response = await axiosSecure.post('/api/shipping-zone/add', shippingData);
      if (response?.data?.insertedId) {

        // Remove saved values after success
        localStorage.removeItem("shippingZone");
        localStorage.removeItem("selectedCities");

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
                    Shipment Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipment added successfully!
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
        router.push("/supply-chain/zone/existing-zones");
      } else {
        throw new Error('Failed to add shipping zone');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add shipping zone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isShipmentHandlerPending || isUserLoading) {
    return <Loading />
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Shipping Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/zone"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Shipping Zone Input */}
            <div className="w-full">
              <label htmlFor='shippingZone' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Shipping Zone <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                placeholder="Add Shipping Zone"
                {...register('shippingZone', { required: 'Shipping Zone is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.shippingZone && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.shippingZone.message}</p>
              )}
            </div>

            <div className="w-full">
              {/* City Label */}
              <label htmlFor='city' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select City <span className="text-red-600 pl-1">*</span></label>
              <div className='flex items-center justify-center gap-4'>
                <input
                  type="text"
                  placeholder="Search or select a city"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)} // Delay to allow selection
                  className="h-11 flex-1 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />

                {/* Select All Button */}
                {selectedCities?.length > 71 ? "" : <button
                  type="button"
                  onClick={handleSelectAll}
                  className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700"
                >
                  <MdCheckBox size={18} /> Select All
                </button>}

                {/* Unselect All Button */}
                {selectedCities?.length > 2 && <button
                  type="button"
                  onClick={handleUnselectAll}
                  className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700"
                >
                  <MdCheckBoxOutlineBlank size={20} />  Unselect All
                </button>}

              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showCitySuggestions && (
              <div>
                {filteredCities?.length > 0 ?
                  <ul
                    ref={suggestionsRefCity}
                    className="w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto z-[9999]"
                  >
                    {filteredCities.map((city, i) => (
                      <li
                        key={i}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors duration-150"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul> : <p>No city matches your search.</p>
                }
              </div>
            )}

            {cityError && <p className='text-left text-red-500 font-semibold text-xs'>City selection is required.</p>}

            {/* Selected Cities */}
            <div>
              {selectedCities?.length > 0 && <h3 className="mt-2 mb-2 font-semibold">Selected Cities</h3>}
              <div className='flex flex-wrap gap-3 mb-4'>
                {selectedCities.map((city, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700"
                  >
                    <span>{city}</span>
                    <button
                      type="button"
                      onClick={() => handleCityRemove(index)}
                      className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                    >
                      <RxCross2 size={19} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Shipping Handler Selection */}
            <label htmlFor='shipmentHandler' className="flex justify-start font-semibold text-neutral-500 text-sm">Manage Shipment Handler <span className="text-red-600 pl-1">*</span></label>
            <div className="flex overflow-x-auto custom-scrollbar pb-4 items-start justify-start gap-4">
              {shipmentHandlerList?.map((shipmentHandler) => (
                <div
                  key={shipmentHandler._id}
                  onClick={() => toggleLogoSelection(shipmentHandler?._id)} // Click to select handler
                  className={`relative cursor-pointer border-2 rounded-md w-40 h-44 min-w-[120px] min-h-[170px] 
                  ${shipmentHandler?.imageUrl ? "p-2" : "p-8"} 
                  ${selectedShipmentHandlerId === shipmentHandler._id ? 'border-blue-500' : 'border-gray-300'}`}>

                  {/* Icons Section */}
                  <div className="absolute top-2 right-2 flex items-center justify-between space-x-2">
                    {isOwner &&
                      <div className="group relative">
                        <button className='group'>
                          <RiDeleteBinLine
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShipmentHandler(e, shipmentHandler._id);
                            }}
                            size={22}
                            className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-105 hover:duration-200"
                          />
                        </button>
                        <span className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                          Delete
                        </span>
                      </div>
                    }

                    <div className="group relative">
                      <button className='group'>
                        <AiOutlineEdit
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditShipmentHandler(e, shipmentHandler._id);
                          }}
                          size={22}
                          className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-105 hover:duration-200"
                        />
                      </button>
                      <span className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                        Edit
                      </span>
                    </div>

                  </div>

                  {/* Shipment Handler Image */}
                  {shipmentHandler?.imageUrl && <Image src={shipmentHandler?.imageUrl} alt="shipment" height={600} width={600} className="h-32 w-32 object-contain" />}

                  {/* Shipment Handler Name */}
                  <p className="text-center">{shipmentHandler.shipmentHandlerName}</p>
                </div>
              ))}

              {/* Add New Shipment Handler Button */}
              <div>
                <Link
                  href="/supply-chain/zone/add-shipment-handler"
                  className="relative w-36 h-44 min-w-[110px] min-h-[170px] px-14 xl:px-8 border-2 border-dashed border-gray-600 bg-white text-gray-600 font-extrabold rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-300 group hover:bg-[#ffddc2] hover:text-gray-800 hover:border-transparent hover:shadow-xl gap-2"
                >
                  <FaPlusCircle className="transition-transform transform group-hover:scale-110 group-hover:text-gray-800 animate-pulse text-2xl" />
                  <span className='text-[13px] text-center'>New Shipment Handler</span>
                </Link>
              </div>

            </div>

            {sizeError && <p className='text-left text-red-500 font-semibold text-xs'>Please select at least one shipment handler.</p>}

            {selectedShipmentHandler?.deliveryType.length === 1 && <div className="w-full mt-4">

              {/* Conditionally render shipping charge input fields based on deliveryType */}
              <div className='flex flex-col md:flex-row gap-6 items-center justify-between w-full'>

                <div className='w-full'>
                  <label htmlFor='shippingCharge' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">{selectedShipmentHandler?.deliveryType[0]} Shipping Charge <span className="text-red-600 pl-1">*</span></label>
                  <input
                    type="number"
                    placeholder={`Enter Shipping Charge for ${selectedShipmentHandler?.deliveryType[0]}`}
                    {...register('shippingCharge', { required: 'Shipping Charge is required' })}
                    className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  />
                  {errors.shippingCharge && (
                    <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingCharge?.message}</p>
                  )}
                </div>

                <div className='w-full'>
                  <label htmlFor='shippingDays' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">{selectedShipmentHandler?.deliveryType[0]} Shipping {selectedShipmentHandler?.deliveryType[0] === "express" ? "Hours" : "Days"} <span className="text-red-600 pl-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter Shipping ${selectedShipmentHandler?.deliveryType[0] === "express" ? "hours" : "days"} for ${selectedShipmentHandler?.deliveryType[0]}`}
                    {...register('shippingTime', { required: `Shipping ${selectedShipmentHandler?.deliveryType[0] === "express" ? "Hour" : "Days"} is required` })}
                    className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '-'];
                      if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errors.shippingTime && (
                    <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingTime?.message}</p>
                  )}
                </div>

              </div>

            </div>}

            {/* Shipping Charge Input */}
            {selectedShipmentHandler?.deliveryType?.length === 2 && <div className="w-full mt-4">
              {/* Conditionally render shipping charge input fields based on deliveryType */}

              <div className='flex flex-col items-center justify-center gap-4 w-full'>
                <div className='flex items-center w-full gap-4'>
                  <div className='w-full'>
                    {/* Input for STANDARD shipping charge */}
                    <label htmlFor='shippingChargeStandard' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2"> STANDARD Charge <span className="text-red-600 pl-1">*</span></label>
                    <input
                      type="number"
                      placeholder="Enter Shipping Charge for STANDARD"
                      {...register('shippingChargeStandard', { required: 'STANDARD Shipping Charge is required' })}
                      className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                    />
                    {errors.shippingChargeStandard && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingChargeStandard?.message}</p>
                    )}
                  </div>
                  <div className='w-full'>
                    {/* Input for STANDARD shipping charge */}
                    <label htmlFor='shippingDaysStandard' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2"> STANDARD Days <span className="text-red-600 pl-1">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter Shipping days for STANDARD"
                      {...register('shippingDaysStandard', { required: 'STANDARD Shipping days is required' })}
                      className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '-'];
                        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.shippingDaysStandard && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingDaysStandard?.message}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center w-full gap-4'>
                  <div className='w-full'>
                    {/* Input for EXPRESS shipping charge */}
                    <label htmlFor='shippingChargeExpress' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2"> EXPRESS Charge <span className="text-red-600 pl-1">*</span></label>
                    <input
                      type="number"
                      placeholder="Add Shipping Charge for EXPRESS"
                      {...register('shippingChargeExpress', { required: 'EXPRESS Shipping Charge is required' })}
                      className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                    />
                    {errors.shippingChargeExpress && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingChargeExpress?.message}</p>
                    )}
                  </div>
                  <div className='w-full'>
                    {/* Input for EXPRESS shipping charge */}
                    <label htmlFor='shippingHourExpress' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2"> EXPRESS Hours <span className="text-red-600 pl-1">*</span></label>
                    <input
                      type="text"
                      placeholder="Add Shipping hour for EXPRESS"
                      {...register('shippingHourExpress', { required: 'EXPRESS Shipping hour is required' })}
                      className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '-'];
                        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.shippingHourExpress && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{errors?.shippingHourExpress?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>}

          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>
            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}>
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default AddShippingZone;