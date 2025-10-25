"use client";
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa6';
import { cities } from '@/app/data/cities';
import Image from 'next/image';
import useShipmentHandlers from '@/app/hooks/useShipmentHandlers';
import Loading from '@/app/components/shared/Loading/Loading';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { FiSave } from 'react-icons/fi';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';

export default function EditShippingZone() {
  const router = useRouter();
  const params = useParams();
  const axiosSecure = useAxiosSecure();
  const [selectedShipmentHandlerId, setSelectedShipmentHandlerId] = useState("");
  const [shippingCharges, setShippingCharges] = useState({});
  const [shippingDurations, setShippingDurations] = useState({});
  const [shipmentHandlerList, isShipmentHandlerPending] = useShipmentHandlers();
  const [sizeError, setSizeError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [cityError, setCityError] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const suggestionsRefCity = useRef(null);
  const { status } = useSession();
  const hasFetched = useRef(false);

  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting }
  } = useForm();

  const fetchShippingZone = useCallback(async () => {
    try {
      const { data } = await axiosSecure.get(`/api/shipping-zone/single/${params.id}`);

      setValue('shippingZone', data?.shippingZone);
      setSelectedCities(data?.selectedCity);
      setSelectedShipmentHandlerId(data?.selectedShipmentHandlerId);
      setShippingCharges(data?.shippingCharges);
      setShippingDurations(data?.shippingDurations);

      // Set shipping charges based on delivery types
      if (data?.shippingCharges) {
        const deliveryTypes = data?.selectedShipmentHandler?.deliveryType;

        if (deliveryTypes) {
          if (deliveryTypes.length === 1) {
            // Only one delivery type, set the single shipping charge
            const deliveryType = deliveryTypes[0];
            setValue('shippingCharge', data.shippingCharges[deliveryType]);
          } else if (deliveryTypes.length > 1) {
            // Set values for both STANDARD and EXPRESS charges
            if (data.shippingCharges.STANDARD) {
              setValue('shippingChargeStandard', data.shippingCharges.STANDARD);
            }
            if (data.shippingCharges.EXPRESS) {
              setValue('shippingChargeExpress', data.shippingCharges.EXPRESS);
            }
          }
        }
      }

      // Set shipping durations based on delivery types
      if (data?.shippingDurations) {
        const deliveryTypes = data?.selectedShipmentHandler?.deliveryType;

        if (deliveryTypes) {
          if (deliveryTypes.length === 1) {
            // Only one delivery type, set the single shipping duration
            const deliveryType = deliveryTypes[0];
            setValue('shippingTime', data.shippingDurations[deliveryType]);
          } else if (deliveryTypes.length > 1) {
            // Set values for both STANDARD and EXPRESS durations
            if (data.shippingDurations.STANDARD) {
              setValue('shippingDaysStandard', data.shippingDurations.STANDARD);
            }
            if (data.shippingDurations.EXPRESS) {
              setValue('shippingHourExpress', data.shippingDurations.EXPRESS);
            }
          }
        }
      }

    } catch (error) {
      // toast.error("Failed to load shipping zone details.");
      router.push('/supply-chain/zone/existing-zones');
    }
  }, [axiosSecure, params.id, router, setValue]);

  useEffect(() => {
    if (!params.id || typeof window === "undefined") return;

    if (status !== "authenticated") return;

    if (!hasFetched.current) {
      fetchShippingZone();
      hasFetched.current = true; // mark as fetched
    }

  }, [params.id, fetchShippingZone, status]);

  // Filter cities based on the search term and exclude selected cities
  const filteredCities = cities.filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase()) &&
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

  // if needed then apply edit option for logo selection
  // const toggleLogoSelection = (shipmentHandlerId) => {
  //   // If the same handler is clicked again, deselect it
  //   if (selectedShipmentHandlerId?._id === shipmentHandlerId) {
  //     setSelectedShipmentHandlerId(null);
  //   } else {
  //     // Replace the selection with the newly clicked handler
  //     setSelectedShipmentHandlerId(shipmentHandlerId);
  //     setSizeError(false); // Clear error when a handler is selected
  //   }
  // };

  const onSubmit = async (formData) => {
    let hasError = false;

    // Validate shipment handler selection
    if (!selectedShipmentHandlerId) {
      setSizeError(true);
      hasError = true;
    };

    if (selectedCities.length === 0) {
      setCityError(true);
      hasError = true;
    }

    // Prepare shipping charges and times objects
    let updatedCharges = {};
    let updatedDurations = {};

    // Loop through the state, not the empty object
    const allTypes = Array.from(new Set([
      ...Object.keys(shippingCharges || {}),
      ...Object.keys(shippingDurations || {})
    ]));

    allTypes.forEach((type) => {
      const chargeField = `shippingCharge${type}`;
      const durationField = `shippingTime${type}`;
      updatedCharges[type] = formData[chargeField];
      updatedDurations[type] = formData[durationField];
    });

    if (hasError) return; // Early return if there are validation errors

    try {
      const updatedShippingZone = {
        shippingZone: formData.shippingZone,
        selectedShipmentHandlerId,
        shippingCharges: updatedCharges,
        shippingDurations: updatedDurations,
        selectedCity: selectedCities
      };

      const res = await axiosSecure.put(`/api/shipping-zone/edit/${params.id}`, updatedShippingZone);
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
                    Shipping Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipping Zone updated successfully!
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
        router.push('/supply-chain/zone/existing-zones');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      toast.error('There was an error updating the shipping zone.');
    }
  };

  if (isShipmentHandlerPending || status === "loading") {
    return <Loading />;
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>SHIPPING SETTINGS</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/zone/existing-zones"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Shipping Zone Field */}
            <div className="w-full">
              <label htmlFor='shippingZone' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Shipping Zone <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                disabled
                placeholder="Add Shipping Zone"
                {...register('shippingZone', { required: 'Shipping Zone is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.shippingZone && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.shippingZone.message}</p>
              )}
            </div>

            <div className="w-full">
              <label htmlFor='city' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select City <span className="text-red-600 pl-1">*</span></label>
              {/* City Selection */}
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
                  <MdCheckBoxOutlineBlank size={20} /> Unselect All
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

            {/* Shipment Handlers */}
            <label htmlFor='shipmentHandler' className="flex justify-start font-semibold text-neutral-500 text-sm">Manage Shipment Handler <span className="text-red-600 pl-1">*</span></label>
            <div className="flex flex-wrap items-center justify-start gap-4">
              {shipmentHandlerList?.map((shipmentHandler) => (
                <div
                  key={shipmentHandler?._id}  // Always use unique keys
                  // onClick={() => toggleLogoSelection(shipmentHandler)}
                  className={`cursor-pointer border-2 rounded-md p-2 ${selectedShipmentHandlerId === shipmentHandler._id ? 'border-blue-500' : 'border-gray-300'}`}
                >
                  {shipmentHandler?.imageUrl && <Image src={shipmentHandler?.imageUrl} alt="shipment" height={300} width={300} className="h-24 w-24 xl:h-32 xl:w-32 object-contain" />}
                  <p className="text-center">{shipmentHandler?.shipmentHandlerName}</p>
                </div>
              ))}
              {/* Display error message if no shipment handler is selected */}
              {sizeError && <p className='text-left text-red-500 font-semibold text-xs'>Please select at least one shipment handler.</p>}
            </div>

            {Object.keys(shippingCharges || {}).length > 0 && (
              <div className="w-full mt-4">
                <div className="flex flex-col gap-6">
                  {Object.keys(shippingCharges).map((type) => (
                    <div
                      key={type}
                      className="flex flex-col md:flex-row gap-6 items-center justify-between w-full"
                    >
                      {/* Charge input */}
                      <div className="w-full">
                        <label htmlFor={`${type}Charge`} className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                          {type} Charge
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <input
                          type="number"
                          disabled
                          defaultValue={shippingCharges[type] || ""}
                          placeholder={`Enter Shipping Charge for ${type}`}
                          {...register(`shippingCharge${type}`, {
                            required: `${type} Shipping Charge is required`,
                          })}
                          className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        />
                        {errors[`shippingCharge${type}`] && (
                          <p className="text-left text-red-500 font-semibold text-xs">
                            {errors[`shippingCharge${type}`]?.message}
                          </p>
                        )}
                      </div>

                      {/* Duration input */}
                      <div className="w-full">

                        <label htmlFor={`${type} ${type === "EXPRESS" ? "Hours" : "Days"}`} className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                          {type} {type === "EXPRESS" ? "Hours" : "Days"}
                          <span className="text-red-600 pl-1">
                            *
                          </span>
                        </label>

                        <input
                          type="text"
                          disabled
                          defaultValue={shippingDurations?.[type] || ""}
                          placeholder={`Enter Shipping ${type === "EXPRESS" ? "hours" : "days"} for ${type}`}
                          {...register(`shippingTime${type}`, {
                            required: `${type} Shipping ${type === "EXPRESS" ? "Hour" : "Days"} is required`,
                          })}
                          className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        />
                        {errors[`shippingTime${type}`] && (
                          <p className="text-left text-red-500 font-semibold text-xs">
                            {errors[`shippingTime${type}`]?.message}
                          </p>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>

            <button
              type='submit'
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'} <FiSave size={20} />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}