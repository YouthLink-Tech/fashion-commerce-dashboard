"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { Checkbox } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const EditLocation = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [isSelected, setIsSelected] = useState(false);
  const { data: session, status } = useSession();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchLocationDetails = async () => {
      try {
        const { data } = await axiosSecure.get(`/getSingleLocationDetails/${id}`);

        setValue('locationName', data?.locationName);
        setValue('contactPersonName', data?.contactPersonName);
        setValue('contactPersonNumber', data?.contactPersonNumber);
        setValue('locationAddress', data?.locationAddress);
        setValue('cityName', data?.cityName);
        setValue('postalCode', data?.postalCode);
        setIsSelected(data?.isPrimaryLocation);

      } catch (error) {
        toast.error("Failed to load this location details.");
      }
    };

    fetchLocationDetails();
  }, [id, setValue, axiosSecure, session?.user?.accessToken, status]);

  const onSubmit = async (data) => {
    try {

      const { locationName, contactPersonName, contactPersonNumber, locationAddress, cityName, postalCode } = data;

      const locationData = {
        locationName,
        contactPersonName,
        contactPersonNumber,
        locationAddress,
        cityName,
        postalCode,
        isPrimaryLocation: isSelected,
      };

      const res = await axiosSecure.put(`/updateLocation/${id}`, locationData);
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
                    Location Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Location has been updated successfully!
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
        router.push('/supply-chain/locations');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing location:', error);
      toast.error('There was an error editing the location. Please try again.');
    }
  };

  if (status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>Edit Location Details</h3>
          <Link
            className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full'
            href={`/supply-chain/locations`}>
            <span className='border border-black rounded-full p-1 md:p-2'>
              <FaArrowLeft />
            </span>
            Go Back
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto py-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            {/* Location name Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Location Name *</label>
              <input
                type="text"
                placeholder="Add Location Name"
                {...register('locationName', { required: 'Location is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.locationName && (
                <p className="text-red-600 text-left">{errors.locationName.message}</p>
              )}
            </div>

            {/* Contact person name of the Location Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Contact Person Name *</label>
              <input
                type="text"
                placeholder="Add Contact Person Name"
                {...register('contactPersonName', { required: 'Contact Person Name is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.contactPersonName && (
                <p className="text-red-600 text-left">{errors.contactPersonName.message}</p>
              )}
            </div>

            {/* Contact person number of the Location Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Contact Person Number *</label>
              <input
                type="number"
                placeholder="Add Contact Person Number"
                {...register('contactPersonNumber', { required: 'Contact Person Number is required' })}
                className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.contactPersonNumber && (
                <p className="text-red-600 text-left">{errors.contactPersonNumber.message}</p>
              )}
            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Location Address of the Location Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Address *</label>
              <input
                type="text"
                placeholder="Add Location Address"
                {...register('locationAddress', { required: 'Location Address is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.locationAddress && (
                <p className="text-red-600 text-left">{errors.locationAddress.message}</p>
              )}
            </div>

            <div className='flex items-center gap-6'>
              <div className="w-full">
                <label className="flex justify-start font-medium text-[#9F5216] pb-2">City *</label>
                <input
                  type="text"
                  placeholder="Add City"
                  {...register('cityName', { required: 'City is required' })}
                  className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                />
                {errors.cityName && (
                  <p className="text-red-600 text-left">{errors.cityName.message}</p>
                )}
              </div>
              <div className="w-full">
                <label className="flex justify-start font-medium text-[#9F5216] pb-2">Postal Code *</label>
                <input
                  type="number"
                  placeholder="Add Postal Code"
                  {...register('postalCode', { required: 'Postal Code is required' })}
                  className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                />
                {errors.postalCode && (
                  <p className="text-red-600 text-left">{errors.postalCode.message}</p>
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
            <button
              type='submit'
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'} <FiSave size={18} />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default EditLocation;