"use client";
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdOutlineFileUpload } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa6';
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';

const defaultImages = ["https://i.ibb.co.com/b7TyG4Y/8271908.png",
  "https://i.ibb.co.com/PgJc6zx/halloween.png",
  "https://i.ibb.co.com/Jdj0vxq/images-1.png",
  "https://i.ibb.co.com/rvhWWdn/2069370.png",
  "https://i.ibb.co.com/1GNFjYm/3446415.png",
  "https://i.ibb.co.com/ZBXyX9v/images-2.png",
  "https://i.ibb.co.com/h1sXckV/7321005.png",
  "https://i.ibb.co.com/5kKw3Tp/4259951.png",
  "https://i.ibb.co.com/QNY12t0/3771178.png"];

const AddSeason = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const axiosPublic = useAxiosPublic();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDefaultImage, setSelectedDefaultImage] = useState(null);

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

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

    const uploadedImageUrl = await uploadSingleFileToGCS(file);
    if (uploadedImageUrl) {
      setImage(uploadedImageUrl);
    }
    setSelectedDefaultImage(null); // Clear the default image selection when a file is uploaded

  };

  const handleImageRemove = () => {
    setImage(null);
    setSelectedDefaultImage(null); // Clear image selection
  };

  const handleDefaultImageSelect = (defaultImage) => {
    setSelectedDefaultImage(defaultImage);
    setImage(null); // Clear uploaded image if a default image is selected
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const seasonData = {
      seasonName: data?.seasonName,
      imageUrl: selectedDefaultImage === null ? image : selectedDefaultImage,
    };

    try {
      const response = await axiosPublic.post('/addSeason', seasonData);

      if (response.status === 201) {
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
                    New Season Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Season has been added successfully!
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
        router.push("/product-hub/seasons")
      } else {
        throw new Error('Failed to add season');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add season. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>SEASON CONFIGURATION</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/seasons"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>
            <div>
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Season *</label>
              <input
                type="text"
                placeholder="Add Season Name"
                {...register('seasonName', { required: 'Season is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.seasonName && (
                <p className="text-red-600 text-left">{errors.seasonName.message}</p>
              )}
            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            <div>
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

              {/* Display uploaded image or selected default image */}
              {(image || selectedDefaultImage) && (
                <div className='relative'>
                  <Image
                    src={image || selectedDefaultImage}
                    alt='Selected or uploaded image'
                    height={2000}
                    width={2000}
                    className='w-1/2 mx-auto md:h-[350px] mt-8 rounded-md'
                  />
                  <button
                    onClick={handleImageRemove}
                    className='absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold'
                  >
                    <RxCross2 size={24} />
                  </button>
                </div>
              )}

              {/* Show default images for selection if no image is uploaded */}
              {!image && !selectedDefaultImage && (
                <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-8 xl:gap-4 my-16'>
                  {defaultImages.map((defaultImage, index) => (
                    <div key={index} onClick={() => handleDefaultImageSelect(defaultImage)} className='cursor-pointer'>
                      <Image
                        src={defaultImage}
                        alt={`Default image ${index + 1}`}
                        height={2000}
                        width={2000}
                        className='w-full rounded-md object-contain'
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className='flex justify-end pt-4 pb-8'>

            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}>
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>
          </div>
        </div>
      </form >
    </div>
  );
};

export default AddSeason;