"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import standardImage from "/public/logos/standard.png";
import expressImage from "/public/logos/express.png";
import { FiSave } from 'react-icons/fi';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import Loading from '@/app/components/shared/Loading/Loading';

const EditShipmentHandler = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const [image, setImage] = useState(null);
  const [deliveryType, setDeliveryType] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const DEFAULT_IMAGE_URL = "https://storage.googleapis.com/fashion-commerce-pdf/1748149508141_default-image.png";

  const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      shipmentHandlerName: '',
      contactPersonName: '',
      contactPersonNumber: '',
      officeAddress: '',
      trackingUrl: '',
      imageUrl: '',
      deliveryType: []
    }
  });

  useEffect(() => {

    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchShipmentHandler = async () => {
      try {
        const { data } = await axiosSecure.get(`/getSingleShipmentHandler/${id}`);
        setValue('shipmentHandlerName', data?.shipmentHandlerName);
        setValue('contactPersonName', data?.contactPersonName);
        setValue('contactPersonNumber', data?.contactPersonNumber);
        setValue('officeAddress', data?.officeAddress);
        setValue('trackingUrl', data?.trackingUrl);
        setDeliveryType(data?.deliveryType || []);
        setValue('deliveryType', data?.deliveryType || []);
        setImage(data?.imageUrl);
      } catch (error) {
        toast.error("Failed to load shipping zone details.");
      }
    };

    fetchShipmentHandler();
  }, [id, setValue, axiosSecure, session?.user?.accessToken, status]);

  const handleDeliveryType = (option) => {
    let deliveryTypes;
    if (deliveryType?.includes(option)) {
      deliveryTypes = deliveryType?.filter(item => item !== option);
    } else {
      deliveryTypes = [...deliveryType, option];
    }
    setDeliveryType(deliveryTypes);
    setValue('deliveryType', deliveryTypes); // Update the form value
    trigger('deliveryType'); // Manually trigger validation
  };

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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Immediately upload the selected image to Imgbb
      const uploadedImageUrl = await uploadSingleFileToGCS(file);
      if (uploadedImageUrl) {
        setImage(uploadedImageUrl);
      }
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    document.getElementById('imageUpload').value = ''; // Clear the file input
  };

  const onSubmit = async (data) => {
    try {

      const updatedShipmentHandler = {
        shipmentHandlerName: data?.shipmentHandlerName,
        contactPersonName: data?.contactPersonName,
        contactPersonNumber: data?.contactPersonNumber,
        officeAddress: data?.officeAddress,
        trackingUrl: data?.trackingUrl ? data?.trackingUrl : "",
        imageUrl: image === null ? DEFAULT_IMAGE_URL : image,
        deliveryType
      };

      const res = await axiosSecure.put(`/editShipmentHandler/${id}`, updatedShipmentHandler);
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
                    Shipment Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipment Handler updated successfully!
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
        router.push('/supply-chain/zone/add-shipping-zone');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing shipment handler:', error);
      toast.error('There was an error editing the shipment handler. Please try again.');
    }
  };

  if (status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-screen'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>Edit Shipment Handler</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/zone/add-shipping-zone"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            {/* Shipment handler name Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Shipment Handler Name *</label>
              <input
                type="text"
                placeholder="Add Shipment Handler Name"
                {...register('shipmentHandlerName', { required: 'Shipment handler Name is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.shipmentHandlerName && (
                <p className="text-red-600 text-left">{errors.shipmentHandlerName.message}</p>
              )}
            </div>

            {/* Contact person name of the Shipment handler Input */}
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

            {/* Contact person number of the Shipment handler Input */}
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

            {/* Office Address of the Shipment handler Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Office Address</label>
              <input
                type="text"
                placeholder="Add Office Address"
                {...register('officeAddress')}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
            </div>

            {/* Tracking URL of the Shipment handler Input */}
            <div className="w-full">
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Tracking URL</label>
              <input
                type="text"
                placeholder="Add tracking url"
                {...register('trackingUrl')}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
            </div>

            {/* Delivery type of the Shipment handler Input */}
            <div className="flex flex-col w-full gap-4">
              <label className="font-medium text-[#9F5216]">Select Delivery Type *</label>
              {/* Standard Option */}
              <div className='flex items-center gap-4'>
                <div
                  onClick={() => handleDeliveryType('STANDARD')}
                  className={`flex items-center gap-2 border rounded-lg px-6 cursor-pointer ${deliveryType?.includes('STANDARD') ? 'border-[#ffddc2] bg-[#ffddc2]' : 'bg-white'
                    }`}
                >
                  <Image
                    className="object-contain h-12 w-12 rounded-lg"
                    src={standardImage}
                    alt="standard image"
                    height={400}
                    width={400}
                  />
                  <h1 className="font-bold">STANDARD</h1>
                </div>

                {/* Express Option */}
                <div
                  onClick={() => handleDeliveryType('EXPRESS')}
                  className={`flex items-center gap-2 border rounded-lg px-6 cursor-pointer ${deliveryType?.includes('EXPRESS') ? 'border-[#ffddc2] bg-[#ffddc2]' : 'bg-white'
                    }`}
                >
                  <Image
                    className="object-contain h-12 w-12 rounded-lg"
                    src={expressImage}
                    alt="express image"
                    height={400}
                    width={400}
                  />
                  <h1 className="font-bold">EXPRESS</h1>
                </div>
              </div>
            </div>

            {/* Error Message of delivery type */}
            {errors.deliveryType && (
              <p className="text-red-500">Please Select at least One Delivery Type.</p>
            )}

            {/* Hidden Input for Validation */}
            <input
              type="hidden"
              {...register('deliveryType', { validate: (value) => value.length > 0 })}
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
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'} <FiSave size={20} />
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default EditShipmentHandler;