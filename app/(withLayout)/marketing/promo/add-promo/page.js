"use client";
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { DatePicker, Tab, Tabs } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const AddPromo = () => {

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoDiscountType, setPromoDiscountType] = useState('Percentage');
  const [dateError, setDateError] = useState(false);
  const [promoDescription, setPromoDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleTabChange = (key) => {
    setPromoDiscountType(key);
    setValue('maxAmount', '');
  };

  const handleShowDateError = (date) => {
    if (date) {
      setDateError(false);
      return;
    }
    setDateError(true);
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Get month and pad with 0 if needed
    const day = (`0${date.getDate()}`).slice(-2);       // Get day and pad with 0 if needed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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
    };
  };

  const handleImageRemove = () => {
    setImage(null);
  };

  const handleGoBack = async () => {
    localStorage.setItem('activeTabMarketingPage', "create promotions");
    router.push("/marketing");
  }

  const onSubmit = async (data) => {
    const { promoCode, promoDiscountValue, expiryDate, maxAmount, minAmount } = data;

    // Get today's date (ignoring time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset hours to make it a date-only comparison

    // Check if expiryDate is selected
    if (!expiryDate) {
      setDateError(true);
      return;  // Do not show toast here, just prevent submission
    }

    // Check if expiryDate is in the past
    const selectedExpiryDate = new Date(expiryDate);
    if (selectedExpiryDate < today) {
      toast.error("Expiry date cannot be in the past.");
      return;  // Prevent form submission
    }

    // If date is valid, reset the date error
    setDateError(false);

    const formattedExpiryDate = formatDate(expiryDate);

    setIsSubmitting(true);

    try {
      const discountData = {
        promoCode: promoCode.toUpperCase(),
        promoDiscountValue,
        promoDiscountType,
        expiryDate: formattedExpiryDate,
        maxAmount: maxAmount ? maxAmount : 0,
        minAmount: minAmount ? minAmount : 0,
        promoDescription,
        imageUrl: image === null ? "" : image,
        promoStatus: true
      };

      const response = await axiosSecure.post('/addPromoCode', discountData);
      if (response.data.insertedId) {
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
                    Promo Published!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    The promo has been successfully launched!
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
        localStorage.setItem('activeTabMarketingPage', "view performance");
        router.push("/marketing");
      }
    } catch (err) {
      toast.error("Failed to publish promo!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen'>

      <div className='max-w-screen-2xl px-6 mx-auto'>

        <div className='max-w-screen-xl mx-auto pt-3 sticky top-0 z-10 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <h3 className='w-full font-semibold text-lg md:text-xl lg:text-2xl'>Promo Configuration</h3>
            <button className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' onClick={() => handleGoBack()}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='max-w-screen-xl mx-auto pt-1 pb-6 flex flex-col'>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6'>
            <div className='grid grid-cols-1 lg:col-span-7 gap-8 mt-3 py-3 h-fit'>
              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
                <div>
                  <label htmlFor='promoCode' className='flex justify-start font-medium text-[#9F5216] pb-2'>Promo Code *</label>
                  <input id='promoCode' placeholder='Enter Promo Code'  {...register("promoCode", { required: true })} className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md uppercase" type="text" />
                  {errors.promoCode?.type === "required" && (
                    <p className="text-red-600 text-left">Promo Code is required</p>
                  )}
                </div>

                <div className="flex w-full flex-col">
                  <Tabs
                    aria-label="Discount Type"
                    selectedKey={promoDiscountType}
                    onSelectionChange={handleTabChange}
                  >
                    <Tab className='text-[#9F5216]' key="Percentage" title="Percentage">Percentage (%) *</Tab>
                    <Tab className='text-[#9F5216]' key="Amount" title="Amount">Amount (Taka) *</Tab>
                  </Tabs>

                  <input
                    type="number"
                    {...register('promoDiscountValue', { required: true })}
                    className='custom-number-input w-full p-3 border rounded-md border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000'
                    placeholder={`Enter ${promoDiscountType} Discount`} // Correct placeholder
                  />
                  {errors.promoDiscountValue?.type === "required" && (
                    <p className="text-red-600 text-left">Discount Value is required</p>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                <div>
                  <label htmlFor='minAmount' className='flex justify-start font-medium text-[#9F5216] pb-2'>Minimum Order Amount *</label>
                  <input id='minAmount' {...register("minAmount", { required: true })} placeholder='Enter Minimum Order Amount' className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md" type="number" />
                  {errors.minAmount?.type === "required" && (
                    <p className="text-red-600 text-left">Min Amount is required</p>
                  )}
                </div>

                {promoDiscountType === "Percentage" && <div>
                  <label htmlFor='maxAmount' className='flex justify-start font-medium text-[#9F5216] pb-2'>Maximum Capped Amount *</label>
                  <input id='maxAmount' {...register("maxAmount", { required: true })} placeholder='Enter Maximum Capped Amount' className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md" type="number" />
                  {errors.maxAmount?.type === "required" && (
                    <p className="text-red-600 text-left">Max Amount is required</p>
                  )}
                </div>}

                <div>
                  <label htmlFor='expiryDate' className='flex justify-start font-medium text-[#9F5216] pb-2'>Promo Expire On *</label>
                  <DatePicker
                    id='expiryDate'
                    placeholder="Select date"
                    aria-label="Select expiry date"
                    onChange={(date) => {
                      handleShowDateError(date);
                      if (date instanceof Date && !isNaN(date)) {
                        setValue('expiryDate', date.toISOString().split('T')[0]); // Ensure it's a valid Date object and format it as YYYY-MM-DD
                      } else {
                        setValue('expiryDate', date); // If DatePicker returns something else, handle it here
                      }
                    }}
                    className="w-full outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                  />

                  {dateError && (
                    <p className="text-red-600 text-left">Please select Promo Expire Date.</p>
                  )}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:col-span-5 gap-8 mt-3 py-3'>
              <div className='flex flex-col gap-6 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <div className='flex w-full flex-col gap-2'>
                  <label htmlFor='promoDescription' className='flex justify-start font-medium text-[#9F5216]'>Promo Description</label>
                  <Controller
                    name="promoDescription"
                    defaultValue=""
                    control={control}
                    render={() => <Editor
                      value={promoDescription}
                      onChange={(value) => {
                        setPromoDescription(value);
                      }}
                    />}
                  />
                </div>

                <div className='flex flex-col gap-4'>
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
                        src={image}
                        alt='Uploaded image'
                        height={3000}
                        width={3000}
                        className='w-full min-h-[200px] max-h-[200px] rounded-md object-contain'
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
              </div>
            </div>
          </div>

          <div className='flex justify-end items-center'>

            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}>
              {isSubmitting ? 'Creating...' : 'Create'} <MdOutlineFileUpload size={20} />
            </button>

          </div>

        </form>
      </div>

    </div>
  );
};

export default AddPromo;