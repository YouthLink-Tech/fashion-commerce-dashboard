"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const EditVendor = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { data: session, status } = useSession();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      value: '',
      label: '',
      contactPersonNumber: '',
      vendorAddress: '',
      contactPersonName: ''
    }
  });

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchVendorDetails = async () => {
      try {
        const { data } = await axiosSecure.get(`/api/vendor/single/${id}`);

        setValue('vendorName', data?.value);
        setValue('contactPersonName', data?.contactPersonName);
        setValue('contactPersonNumber', data?.contactPersonNumber);
        setValue('vendorAddress', data?.vendorAddress);
      } catch (error) {
        // toast.error("Failed to load this vendor details.");
        router.push('/product-hub/vendors');
      }
    };

    fetchVendorDetails();
  }, [id, setValue, axiosSecure, session?.user?.accessToken, status, router]);

  const onSubmit = async (data) => {
    try {

      const updatedVendorList = {
        value: data?.vendorName,
        label: data?.vendorName,
        contactPersonName: data?.contactPersonName,
        contactPersonNumber: data?.contactPersonNumber,
        vendorAddress: data?.vendorAddress,
      };

      const res = await axiosSecure.put(`/api/vendor/edit/${id}`, updatedVendorList);
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
                    Vendor Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Vendor has been updated successfully!
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
        router.push('/product-hub/vendors');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing Vendor:', error);
      toast.error('There was an error editing the Vendor. Please try again.');
    }
  };

  if (status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto pt-3 md:pt-6 px-6'>
          <div className='flex items-center justify-between'>
            <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Edit Vendor Details</h3>
            <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/vendors"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
          </div>
        </div>

        <div className='max-w-screen-xl mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col lg:flex-row gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Vendor name Input */}
            <div className="w-full">
              <label htmlFor='vendorName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                Vendor Name
                <span className="text-red-600 pl-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Add Vendor Name"
                {...register('vendorName', { required: 'Vendor Name is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.vendorName && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.vendorName.message}</p>
              )}
            </div>

            {/* Contact person name of the Vendor Input */}
            <div className="w-full">
              <label htmlFor='contactPersonName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                Contact Person Name
                <span className="text-red-600 pl-1">*</span>
              </label>
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

            {/* Contact person number of the Vendor Input */}
            <div className="w-full">
              <label htmlFor='contactPersonNumber' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                Contact Person Number
                <span className="text-red-600 pl-1">*</span>
              </label>
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

            {/* Vendor Address of the Vendor Input */}
            <div className="w-full">
              <label htmlFor='vendorAddress' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                Vendor Address
              </label>
              <input
                type="text"
                placeholder="Add Vendor Address"
                {...register('vendorAddress')}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'} <FiSave size={20} />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default EditVendor;