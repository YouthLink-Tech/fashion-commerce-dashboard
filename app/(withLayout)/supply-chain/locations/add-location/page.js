"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { Checkbox } from '@nextui-org/react';
import { MdOutlineFileUpload } from 'react-icons/md';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const AddLocation = () => {
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSelected, setIsSelected] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const { locationName, contactPersonName, contactPersonNumber, locationAddress, cityName, postalCode } = data;

    const locationData = {
      locationName,
      contactPersonName,
      contactPersonNumber,
      locationAddress,
      cityName,
      postalCode,
      isPrimaryLocation: isSelected,
      status: true,
    }

    try {
      const response = await axiosSecure.post('/addLocation', locationData);
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
                    Location Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Location has been added successfully!
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
        router.push("/supply-chain/locations")
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Failed to add location. Please try again!');
    }
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Location Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/locations"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto py-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            {/* Location name Input */}
            <div className="w-full">
              <label htmlFor='locationName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Location Name <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                placeholder="Add Location Name"
                {...register('locationName', { required: 'Location is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.locationName && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.locationName.message}</p>
              )}
            </div>

            {/* Contact person name of the Location Input */}
            <div className="w-full">
              <label htmlFor='contactPersonName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Contact Person Name <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                placeholder="Add Contact Person Name"
                {...register('contactPersonName', { required: 'Contact Person Name is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.contactPersonName && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.contactPersonName.message}</p>
              )}
            </div>

            {/* Contact person number of the Location Input */}
            <div className="w-full">
              <label htmlFor='contactPersonNumber' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Contact Person Number <span className="text-red-600 pl-1">*</span></label>
              <input
                type="number"
                placeholder="Add Contact Person Number"
                {...register('contactPersonNumber', { required: 'Contact Person Number is required' })}
                className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.contactPersonNumber && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.contactPersonNumber.message}</p>
              )}
            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Location Address of the Location Input */}
            <div className="w-full">
              <label htmlFor='locationAddress' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Address <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                placeholder="Add Location Address"
                {...register('locationAddress', { required: 'Location Address is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.locationAddress && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.locationAddress.message}</p>
              )}
            </div>

            <div className='flex items-center gap-6'>
              <div className="w-full">
                <label htmlFor='cityName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">City <span className="text-red-600 pl-1">*</span></label>
                <input
                  type="text"
                  placeholder="Add City"
                  {...register('cityName', { required: 'City is required' })}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />
                {errors.cityName && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.cityName.message}</p>
                )}
              </div>
              <div className="w-full">
                <label htmlFor='postalCode' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Postal Code <span className="text-red-600 pl-1">*</span></label>
                <input
                  type="number"
                  placeholder="Add Postal Code"
                  {...register('postalCode', { required: 'Postal Code is required' })}
                  className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />
                {errors.postalCode && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-2">
            <Checkbox isSelected={isSelected} color="success" onValueChange={setIsSelected}>
              Set as Primary Location
            </Checkbox>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>
            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}>
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default AddLocation;