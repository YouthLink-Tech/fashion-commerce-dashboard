"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import standardImage from "/public/logos/standard.png";
import expressImage from "/public/logos/express.png";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const AddShipmentHandler = () => {

  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [deliveryType, setDeliveryType] = useState([]);
  const router = useRouter();
  const DEFAULT_IMAGE_URL = "https://storage.googleapis.com/fashion-commerce-pdf/1748149508141_default-image.png";
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const { register, handleSubmit, formState: { errors }, trigger, setValue } = useForm();

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

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

  const handleDeliveryType = (option) => {
    let deliveryTypes;
    if (deliveryType.includes(option)) {
      deliveryTypes = deliveryType.filter(item => item !== option);
    } else {
      deliveryTypes = [...deliveryType, option];
    }
    setDeliveryType(deliveryTypes);
    setValue('deliveryType', deliveryTypes); // Update the form value
    trigger('deliveryType'); // Manually trigger validation
  };

  const onSubmit = async (data) => {

    setIsSubmitting(true);

    const { shipmentHandlerName, contactPersonName, contactPersonNumber, officeAddress, trackingUrl } = data;

    const shipmentData = {
      shipmentHandlerName,
      contactPersonName,
      contactPersonNumber,
      officeAddress,
      trackingUrl,
      imageUrl: image || DEFAULT_IMAGE_URL,
      deliveryType
    };

    try {
      const response = await axiosSecure.post('/api/shipment-handler/add', shipmentData);
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
                    Shipment Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipment Handler added successfully!
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
        router.push("/supply-chain/zone/add-shipping-zone");
      } else {
        throw new Error('Failed to add shipment handler');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add shipment handler. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-50'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Add Shipment Handler</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/zone/add-shipping-zone"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-xl mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            <div className='flex flex-col md:flex-row justify-between items-center w-full gap-4 2xl:gap-6'>

              {/* Shipment handler name Input */}
              <div className="w-full">
                <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Shipment Handler Name <span className="text-red-600 pl-1">*</span></label>
                <input
                  type="text"
                  placeholder="Add Shipment Handler Name"
                  {...register('shipmentHandlerName', { required: 'Shipment handler Name is required' })}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />
                {errors.shipmentHandlerName && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.shipmentHandlerName.message}</p>
                )}
              </div>

              {/* Contact person name of the Shipment handler Input */}
              <div className="w-full">
                <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Contact Person Name <span className="text-red-600 pl-1">*</span></label>
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

              {/* Contact person number of the Shipment handler Input */}
              <div className="w-full">
                <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Contact Person Number <span className="text-red-600 pl-1">*</span></label>
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

            <div className='flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-between items-center w-full gap-4 2xl:gap-6'>

              {/* Office Address of the Shipment handler Input */}
              <div className="w-full">
                <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Office Address</label>
                <input
                  type="text"
                  placeholder="Add Office Address"
                  {...register('officeAddress')}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />
              </div>

              {/* Tracking URL of the Shipment handler Input */}
              <div className="w-full">
                <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Tracking URL</label>
                <input
                  type="text"
                  placeholder="Add tracking url"
                  {...register('trackingUrl')}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                />
              </div>

              <div className='w-full'>

                {/* Delivery type of the Shipment handler Input */}
                <div className="flex flex-col w-full gap-2">
                  <label className="flex justify-start font-semibold text-neutral-500 text-sm">Select Delivery Type <span className="text-red-600 pl-1">*</span></label>
                  {/* Standard Option */}
                  <div className='flex items-center gap-4'>
                    <div
                      onClick={() => handleDeliveryType('STANDARD')}
                      className={`flex items-center gap-2 border rounded-lg px-6 cursor-pointer ${deliveryType.includes('STANDARD') ? 'border-[#ffddc2] bg-[#ffddc2]' : 'bg-white'
                        }`}
                    >
                      <Image
                        className="object-contain h-11 w-11 rounded-lg"
                        src={standardImage}
                        alt="standard image"
                        height={400}
                        width={400}
                      />
                      <h1 className="font-bold text-sm">STANDARD</h1>
                    </div>

                    {/* Express Option */}
                    <div
                      onClick={() => handleDeliveryType('EXPRESS')}
                      className={`flex items-center gap-2 border rounded-lg px-6 cursor-pointer ${deliveryType.includes('EXPRESS') ? 'border-[#ffddc2] bg-[#ffddc2]' : 'bg-white'
                        }`}
                    >
                      <Image
                        className="object-contain h-11 w-11 rounded-lg"
                        src={expressImage}
                        alt="express image"
                        height={400}
                        width={400}
                      />
                      <h1 className="font-bold text-sm">EXPRESS</h1>
                    </div>
                  </div>
                </div>

                {/* Error Message of delivery type */}
                {errors.deliveryType && (
                  <p className="text-left text-red-500 font-semibold text-xs pt-2">Please Select at least One Delivery Type.</p>
                )}

                {/* Hidden Input for Validation */}
                <input
                  type="hidden"
                  {...register('deliveryType', { validate: (value) => value.length > 0 })}
                />

              </div>

            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 text-sm">
              Shipment Handler Thumbnail
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
                <p className="text-[11px] text-gray-500">Required size: Flexible (W) x 60 (H)</p>
                <p className="text-[10px] text-amber-600 font-semibold pt-1">Transparent background</p>
              </div>
            </label>

            {imageError && (
              <p className="text-left text-red-500 font-semibold text-xs">{imageError}</p>
            )}

            {image && (
              <div className='relative'>
                <Image
                  src={image}
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

            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}>
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>

          </div>

        </div>
      </form>

    </div>
  );
};

export default AddShipmentHandler;