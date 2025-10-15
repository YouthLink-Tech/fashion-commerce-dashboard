"use client";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { Checkbox, DatePicker, Tab, Tabs } from '@nextui-org/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const AddPromo = () => {

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoDiscountType, setPromoDiscountType] = useState('Percentage');
  const [dateError, setDateError] = useState(false);
  const [promoDescription, setPromoDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  useEffect(() => {
    const clonePromoData = localStorage.getItem("clonePromoData");
    if (clonePromoData) {
      const parsed = JSON.parse(clonePromoData);

      // Prefill form
      reset({
        ...parsed,
        promoCode: "", // force blank
      });

      // Set states too
      if (parsed.promoDiscountType) setPromoDiscountType(parsed.promoDiscountType);
      if (parsed.promoDescription) setPromoDescription(parsed.promoDescription);
      if (parsed.imageUrl) setImage(parsed.imageUrl);
      if (parsed.isWelcomeEmailPromoCode) setIsSelected(parsed.isWelcomeEmailPromoCode);
    }
    localStorage.removeItem("clonePromoData");
  }, [reset]);

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    if (!VALID_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload JPG, PNG, WEBP, or JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be smaller than 10MB.');
      return;
    }

    if (file) {
      // Immediately upload the selected image to GCS
      const uploadedImageUrl = await uploadSingleFileToGCS(file);
      if (uploadedImageUrl) {
        setImage(uploadedImageUrl);
        setImageError("");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
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
        promoStatus: true,
        isWelcomeEmailPromoCode: isSelected,
      };

      const response = await axiosSecure.post('/api/promo-code/add', discountData);
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
        localStorage.removeItem("clonePromoData");
        router.push("/marketing");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error(err.response.data.message || "Promo code already exists!");
      } else {
        toast.error("Failed to publish promo!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen'>

      <div className='max-w-screen-2xl px-6 mx-auto'>

        <div className='max-w-screen-xl mx-auto pt-3 sticky top-0 z-10 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Promo Configuration</h3>
            <button className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' onClick={() => handleGoBack()}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='max-w-screen-xl mx-auto pt-1 pb-6 flex flex-col'>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6'>

            <div className='grid grid-cols-1 lg:col-span-7 gap-8 mt-3 py-3 h-fit'>
              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                <div>
                  <label htmlFor='promoCode' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Promo Code <span className="text-red-600 pl-1">*</span></label>
                  <input id='promoCode' placeholder='Enter Promo Code'  {...register("promoCode", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="text" />
                  {errors.promoCode?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Promo Code is required</p>
                  )}
                </div>

                <div className="flex w-full flex-col">

                  <Tabs
                    aria-label="Discount Type"
                    selectedKey={promoDiscountType}
                    onSelectionChange={handleTabChange}
                  >
                    <Tab className='text-[#9F5216]' key="Percentage" title="Percentage">
                      <span className='font-semibold text-neutral-500 text-sm'>
                        Percentage (%)
                      </span>
                      <span className="text-red-600 pl-1">*</span>
                    </Tab>
                    <Tab className='text-[#9F5216]' key="Amount" title="Amount">
                      <span className='font-semibold text-neutral-500 text-sm'>Amount (Taka)</span>
                      <span className="text-red-600 pl-1">*</span>
                    </Tab>
                  </Tabs>

                  <input
                    type="number"
                    {...register('promoDiscountValue', { required: true })}
                    className='custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold'
                    placeholder={`Enter ${promoDiscountType} Discount`} // Correct placeholder
                  />
                  {errors.promoDiscountValue?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Discount Value is required</p>
                  )}

                </div>

              </div>

              <div>
                <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                  <div>
                    <label htmlFor='minAmount' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Minimum Order Amount <span className="text-red-600 pl-1">*</span></label>
                    <input id='minAmount' {...register("minAmount", { required: true })} placeholder='Enter Minimum Order Amount' className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="number" />
                    {errors.minAmount?.type === "required" && (
                      <p className="text-left pt-2 text-red-500 font-semibold text-xs">Min Amount is required</p>
                    )}
                  </div>

                  {promoDiscountType === "Percentage" &&
                    <div>
                      <label htmlFor='maxAmount' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Maximum Capped Amount <span className="text-red-600 pl-1">*</span></label>
                      <input id='maxAmount' {...register("maxAmount", { required: true })} placeholder='Enter Maximum Capped Amount' className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="number" />
                      {errors.maxAmount?.type === "required" && (
                        <p className="text-left pt-2 text-red-500 font-semibold text-xs">Max Amount is required</p>
                      )}
                    </div>
                  }

                  <div>
                    <label htmlFor='expiryDate' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Promo Expire On <span className="text-red-600 pl-1">*</span></label>
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
                      <p className="text-left pt-2 text-red-500 font-semibold text-xs">Please select Promo Expire Date.</p>
                    )}
                  </div>

                </div>

                <Checkbox isSelected={isSelected} color='success' className={`mt-1 ${isSelected ? "font-semibold" : ""}`} onValueChange={setIsSelected}>
                  Set as Welcome Email Promo Code
                </Checkbox>

              </div>

            </div>

            <div className='grid grid-cols-1 lg:col-span-5 gap-8 mt-3 py-3 h-fit'>
              <div className='flex flex-col gap-6 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <div className='flex w-full flex-col'>
                  <label htmlFor='promoDescription' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Promo Description</label>
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

                  <div>
                    <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                      Promo Thumbnail
                    </label>
                    <input
                      id='imageUpload'
                      type='file'
                      className='hidden'
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor='imageUpload'
                      className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed duration-500 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
                        } hover:border-blue-300 hover:bg-blue-50 p-6 cursor-pointer`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <MdOutlineFileUpload size={60} />
                      <div className='space-y-1.5 text-center text-neutral-500 font-semibold'>
                        <p className="text-[13px]">
                          <span className="text-blue-300 underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-blue-400">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-[11px]">Max image size is 10 MB</p>
                      </div>
                    </label>

                    {imageError && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{imageError}</p>
                    )}
                  </div>

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