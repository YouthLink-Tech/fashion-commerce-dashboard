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
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const AddPaymentMethod = () => {

  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState("");
  const DEFAULT_IMAGE_URL = "https://storage.googleapis.com/fashion-commerce-pdf/1748164462517_default-payment-image.jpg";

  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    setImage({
      src: URL.createObjectURL(file),
      file
    });
  };

  const handleImageRemove = () => {
    setImage(null);
  };

  const uploadSingleFileToGCS = async (image) => {
    try {
      const formData = new FormData();
      formData.append('attachment', image.file);

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
    }
  };

  const onSubmit = async (data) => {

    setIsSubmitting(true);

    const { paymentMethodName } = data;

    let imageUrl = '';
    if (image) {
      imageUrl = await uploadSingleFileToGCS(image);
      if (!imageUrl) {
        toast.error('Image upload failed, cannot proceed.');
        imageUrl = DEFAULT_IMAGE_URL;
        return;
      }
    } else {
      imageUrl = DEFAULT_IMAGE_URL;
    }

    const paymentData = {
      paymentMethodName,
      paymentDetails,
      status: true,
      imageUrl,
    };

    try {
      const response = await axiosSecure.post('/addPaymentMethod', paymentData);
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
        router.push("/finances");
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
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>Payment Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/finances"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            {/* Payment Method name Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Payment Method Name *</label>
              <input
                type="text"
                placeholder="Add Payment Method Name"
                {...register('paymentMethodName', { required: 'Payment Method Name is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.paymentMethodName && (
                <p className="text-red-600 text-left">{errors.paymentMethodName.message}</p>
              )}
            </div>

            {/* Payment Method Description Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Payment Details</label>
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
            <input
              id='imageUpload'
              type='file'
              className='hidden'
              onChange={handleImageChange}
            />
            <label
              htmlFor='imageUpload'
              className='mx-auto flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-gray-400 p-6 bg-white cursor-pointer'
            >
              <MdOutlineFileUpload size={60} />
              <div className='space-y-1.5 text-center'>
                <h5 className='whitespace-nowrap text-lg font-medium tracking-tight'>
                  Upload Thumbnail
                </h5>
                <p className='text-sm text-gray-500'>
                  Photo Should be in PNG, JPEG or JPG format
                </p>
              </div>
            </label>

            {image && (
              <div className='relative'>
                <Image
                  src={image.src}
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