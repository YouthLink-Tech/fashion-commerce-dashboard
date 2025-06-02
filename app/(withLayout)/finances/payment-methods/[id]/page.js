"use client";
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const EditPaymentMethod = () => {

  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const [image, setImage] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const router = useRouter();
  const DEFAULT_IMAGE_URL = "https://storage.googleapis.com/fashion-commerce-pdf/1748164462517_default-payment-image.jpg";

  const {
    register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm({
      defaultValues: {
        paymentMethodName: '',
        paymentDetails: '',
        imageUrl: ''
      }
    });

  useEffect(() => {
    const fetchShipmentHandler = async () => {
      try {
        const { data } = await axiosPublic.get(`/getSinglePaymentMethod/${id}`);
        setValue('paymentMethodName', data?.paymentMethodName);
        setPaymentDetails(data?.paymentDetails);
        setImage(data?.imageUrl);
      } catch (error) {
        toast.error("Failed to load shipping zone details.");
      }
    };

    fetchShipmentHandler();
  }, [id, setValue, axiosPublic]);

  const uploadSingleFileToGCS = async (image) => {
    try {
      const formData = new FormData();
      formData.append('attachment', image);

      const response = await axiosPublic.post('/upload-single-file', formData, {
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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage(uploadedImageUrl);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    document.getElementById('imageUpload').value = ''; // Clear the file input
  };

  const onSubmit = async (data) => {
    try {

      const updatedPaymentMethod = {
        paymentMethodName: data?.paymentMethodName,
        paymentDetails,
        imageUrl: image === null ? DEFAULT_IMAGE_URL : image,
      };

      const res = await axiosPublic.put(`/editPaymentMethod/${id}`, updatedPaymentMethod);
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
                    Payment Method Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Payment Method updated successfully!
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
        router.push('/finances');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing Payment Method:', error);
      toast.error('There was an error editing the Payment Method. Please try again.');
    }
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>Payment Settings</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/finances"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

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
                  Photo Should be in PNG, JPEG, JPG, WEBP or Avif format
                </p>
              </div>
            </label>

            {image && (
              <div className='relative'>
                <Image
                  src={typeof image === 'string' ? image : image.src}
                  alt='Uploaded image'
                  height={2000}
                  width={2000}
                  className='w-1/2 mx-auto h-[350px] mt-8 rounded-lg object-contain'
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

          <div className='flex justify-end items-center'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700 ${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} py-2 px-4 text-sm rounded-md cursor-pointer font-semibold`}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'} <FiSave size={19} />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default EditPaymentMethod;