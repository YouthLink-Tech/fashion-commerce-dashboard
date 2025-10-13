"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import UploadUi from '@/app/components/upload-image/UploadUi';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const AddPaymentMethod = () => {

  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState("");
  const DEFAULT_IMAGE_URL = "https://storage.googleapis.com/fashion-commerce-pdf/1748164462517_default-payment-image.jpg";

  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");

  const handleImageRemove = () => {
    setImage(null);
  };

  const uploadSingleFileToGCS = async (image) => {
    try {
      const formData = new FormData();
      formData.append('attachment', image);

      const response = await axiosSecure.post('/upload-single-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response?.data?.fileUrl) {
        return response.data.fileUrl;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setImageError("Upload failed. Please try again.");
    }
  };

  const handleUploadSuccess = (url) => {
    setImage(url);
  };

  const onSubmit = async (data) => {

    setIsSubmitting(true);

    const { paymentMethodName } = data;

    const paymentData = {
      paymentMethodName,
      paymentDetails,
      status: true,
      imageUrl: image || DEFAULT_IMAGE_URL, // Using image state (URL) directly
    };

    try {
      const response = await axiosSecure.post('/api/payment-method/add', paymentData);
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
                    Payment Method Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Payment Method added successfully!
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
        router.push("/finances/payment-methods");
      } else {
        throw new Error('Failed to add Payment Method');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add Payment Method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Payment Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/finances/payment-methods"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            {/* Payment Method name Input */}
            <div className="w-full">
              <label htmlFor='paymentMethodName' className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Payment Method Name <span className="text-red-600 pl-1">*</span></label>
              <input
                type="text"
                placeholder="Add Payment Method Name"
                {...register('paymentMethodName', { required: 'Payment Method Name is required' })}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              />
              {errors.paymentMethodName && (
                <p className="text-left pt-1 text-red-500 font-semibold text-xs">{errors.paymentMethodName.message}</p>
              )}
            </div>

            {/* Payment Method Description Input */}
            <div className="w-full">
              <label htmlFor='paymentDetails' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                Payment Details
              </label>
              <Controller
                name="paymentDetails"
                defaultValue=""
                control={control}
                render={() => <Editor
                  value={paymentDetails}
                  onChange={(value) => {
                    setPaymentDetails(value);
                  }}
                />}
              />
            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            <div>
              <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                Payment Method Thumbnail
              </label>
              <UploadUi
                dragging={dragging}
                setDragging={setDragging}
                imageError={imageError}
                setImageError={setImageError}
                onUploadSuccess={handleUploadSuccess}
                uploadFile={uploadSingleFileToGCS}
              />
            </div>

            {image && (
              <div className='relative'>
                <Image
                  src={image.src || image}
                  alt='Uploaded image'
                  height={100}
                  width={200}
                  className='w-1/2 mx-auto h-[350px] mt-8 rounded-md'
                />
                <button
                  onClick={handleImageRemove}
                  className='absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold'
                >
                  <RxCross2 size={24} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700 ${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} py-2 px-4 text-sm rounded-md cursor-pointer font-semibold`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default AddPaymentMethod;