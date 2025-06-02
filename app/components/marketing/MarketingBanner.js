"use client";
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import useMarketingBanners from '@/app/hooks/useMarketingBanners';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Loading from '../shared/Loading/Loading';

const MarketingBanner = () => {

  const { handleSubmit } = useForm();
  const axiosPublic = useAxiosPublic();
  const [image, setImage] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [marketingBannerList = [], isMarketingBannerPending, refetch] = useMarketingBanners();

  useEffect(() => {
    if (marketingBannerList && marketingBannerList.length > 0) {
      setSelectedPosition(marketingBannerList[0]?.position); // Assuming you want the first banner's position
      setImage({ src: marketingBannerList[0]?.url, file: null });
    }
  }, [marketingBannerList]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSizeMB = 10;

    if (!file) {
      setSizeError(true);
      toast.error("Please select a file.");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setSizeError(true);
      toast.error("Only PNG, JPEG, JPG, and WEBP formats are allowed.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setSizeError(true);
      toast.error("Image size should not exceed 10MB.");
      return;
    }

    setImage({
      src: URL.createObjectURL(file),
      file,
    });
    setSizeError(false);
  };

  const handleImageRemove = () => {
    setImage(null);
  };

  const uploadSingleFileToGCS = async (image) => {
    const formData = new FormData();
    formData.append('attachment', image.file);  // assuming image = { file: File }

    try {
      const response = await axiosPublic.post('/upload-single-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.fileUrl) {
        return response.data.fileUrl;
      } else {
        toast.error('Failed to get image URL from response.');
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`);
      console.error("Upload error:", error);
    }

    return null;
  };

  const handleSelectChange = (e) => {
    setSelectedPosition(e.target.value);
  };

  const handleGoToPreviewPageAfterUpload = (imageUrl, position) => {
    const previewURL = `/preview/previewNewsletter/?image=${encodeURIComponent(imageUrl)}&position=${encodeURIComponent(position)}`;
    window.open(previewURL, '_blank');
  }

  const onSubmit = async () => {

    if (!image) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    let imageUrl = '';
    // If the image is new, upload it
    if (image?.file) {
      imageUrl = await uploadSingleFileToGCS(image);
      if (!imageUrl) {
        toast.error('Image upload failed, cannot proceed.');
        return;
      }
    } else if (marketingBannerList?.length > 0) {
      // Use the existing URL if no new image was uploaded
      imageUrl = marketingBannerList[0]?.url;
    }

    if (marketingBannerList?.length > 0) {
      const bannerId = marketingBannerList[0]?._id;

      const bannerData = {
        url: imageUrl,
        position: selectedPosition
      };

      try {

        const response = await axiosPublic.put(`/editMarketingBanner/${bannerId}`, bannerData);
        if (response.data.modifiedCount > 0) {
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
                      Marketing banner updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Marketing banner has been successfully updated!
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
          refetch();
        }
        else {
          toast.error('No changes detected.');
        }
      } catch (err) {
        toast.error("Failed to publish marketing details!");
      }
    }
  };

  if (isMarketingBannerPending) {
    return <Loading />
  };

  return (
    <div className='max-w-screen-2xl flex flex-col xl:flex-row justify-between gap-6'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex-1 flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg my-6 h-fit'>

        <div className='flex flex-col w-full'>
          <label htmlFor='selectedPosition' className='font-semibold text-gray-700 mb-1'>
            Content Layout Position
          </label>
          <div className='relative'>
            <select
              id="selectedPosition"
              required
              aria-label="Content layout position"
              onChange={handleSelectChange}
              value={selectedPosition}
              className='appearance-none block w-full px-4 py-2 pr-8 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 transition-colors duration-1000 focus:ring-[#9F5216] focus:border-[#9F5216] text-gray-700'
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 p-5 md:p-7'>
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
          {sizeError && (
            <p className="text-red-600 text-center">Please select image</p>
          )}

          {image && (
            <div className='relative'>
              <Image
                src={image.src}
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

        {/* Submit Button */}
        <div className={`flex justify-end items-center px-5 md:px-7`}>

          <button
            type='submit'
            className={`bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 py-2 px-4 text-sm rounded-lg cursor-pointer font-bold transition-[background-color] duration-300`}
          >
            Update
          </button>
        </div>

      </form>

      <div className='flex-1 flex flex-col gap-6 items-center justify-center my-6 h-fit'>

        {marketingBannerList?.map((marketing, index) => (
          <div key={index} className="rounded-lg bg-white p-5 md:p-7 drop-shadow dark:bg-[#18181B]">
            <Image width={1200} height={1200} alt='marketing-banner' className="h-fit lg:h-[285px] w-[650px] rounded-lg object-contain" src={marketing?.url} />
            <div className="flex justify-between pt-8">
              <div className='flex flex-col items-start gap-3'>
                <p className='text-neutral-500'> <span>Position: </span>
                  {["left", "right", "center"].includes(marketing?.position)
                    ? marketing.position.charAt(0).toUpperCase() + marketing.position.slice(1)
                    : marketing.position}
                </p>
              </div>
              <button type='button' className='text-blue-600 font-bold border-b border-blue-500' onClick={() => handleGoToPreviewPageAfterUpload(marketing?.url, marketing?.position)}>
                Preview
              </button>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default MarketingBanner;