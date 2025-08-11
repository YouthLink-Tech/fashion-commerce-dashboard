"use client";
import useMarketingBanners from '@/app/hooks/useMarketingBanners';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdCancel, MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Loading from '../shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import SelectImage from './SelectImage';
import { useDisclosure } from '@nextui-org/react';

const MarketingBanner = () => {

  const { handleSubmit } = useForm();
  const axiosSecure = useAxiosSecure();
  const [image, setImage] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [marketingBannerList = [], isMarketingBannerPending, refetch] = useMarketingBanners();
  const shouldShowPreview = Boolean(image?.src);
  const [previousImages, setPreviousImages] = useState([]);
  const [tempImage, setTempImage] = useState(null);
  const [dbImageUrl, setDbImageUrl] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [dragging, setDragging] = useState(false);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  useEffect(() => {
    if (marketingBannerList && marketingBannerList.length > 0) {
      const dbUrl = marketingBannerList[0]?.url;
      setDbImageUrl(dbUrl); // ⬅️ Add this
      setSelectedPosition(marketingBannerList[0]?.position); // Assuming you want the first banner's position
      setImage({ src: dbUrl, file: null });
      setPreviousImages(marketingBannerList[0]?.previousUrls);
    }
  }, [marketingBannerList]);

  // Sync tempImage with current image whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTempImage(image);
    }
  }, [isOpen, image]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!VALID_TYPES.includes(file.type)) {
      setSizeError('Invalid file type. Please upload JPG, PNG, WEBP, or JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSizeError('Image must be smaller than 10MB.');
      return;
    }

    setImage({
      src: URL.createObjectURL(file),
      file
    });
    setSizeError('');
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
    setSizeError("Please upload or select marketing banner.")
  };

  const uploadSingleFileToGCS = async (image) => {
    const formData = new FormData();
    formData.append('attachment', image.file);  // assuming image = { file: File }

    try {
      const response = await axiosSecure.post('/upload-single-file', formData, {
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

  const handleGoToPreviewPageBeforeUpload = (image, position) => {
    const previewURL = `/preview/previewMarketingBanner/?image=${encodeURIComponent(image)}&position=${encodeURIComponent(position)}`;
    window.open(previewURL, '_blank');
  };

  const onSubmit = async () => {

    if (!image) {
      setSizeError("Please upload or select marketing banner");
      return;
    }
    setSizeError("");

    let imageUrl = '';
    // If the image is new, upload it
    if (image?.file) {
      imageUrl = await uploadSingleFileToGCS(image);
      if (!imageUrl) {
        toast.error('Image upload failed, cannot proceed.');
        return;
      }
    } else if (image?.src) {
      // If selecting from previous uploads
      imageUrl = image.src;
    }

    if (marketingBannerList?.length > 0) {
      const bannerId = marketingBannerList[0]?._id;

      const bannerData = {
        url: imageUrl,
        position: selectedPosition
      };

      try {

        const response = await axiosSecure.put(`/editMarketingBanner/${bannerId}`, bannerData);
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
          });
          setDbImageUrl(imageUrl);
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
      <form onSubmit={handleSubmit(onSubmit)} className='flex-1 flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-12 rounded-lg my-6 h-fit space-y-4'>

        <div className='flex flex-col w-full'>
          <label htmlFor="selectedPosition" className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
            Content Layout Position <span className="text-red-600 pl-1">*</span>
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

        <div className="flex flex-col gap-6 bg-white rounded-xl">
          {/* Upload & Select */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Upload Section */}
            <div className="flex-1 w-full">
              <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                Marketing Banner Thumbnail <span className="text-red-600 pl-1">*</span>
              </label>
              <input
                id="imageUpload"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
              />
              <label
                htmlFor="imageUpload"
                className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed duration-500 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
                  } hover:border-blue-300 hover:bg-blue-50 p-6 cursor-pointer`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <MdOutlineFileUpload size={48} className="text-blue-500" />
                <div className='space-y-1.5 text-center text-neutral-500 font-semibold'>
                  <p className="text-[13px]">
                    <span className="text-blue-300 underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-blue-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-[11px]">Max image size is 10 MB</p>
                  <p className="text-[11px] text-gray-500">Required size : 1000 (W) x 250 (H)</p>
                  <p className="text-[11px] text-amber-600 font-semibold">Transparent background</p>
                </div>
              </label>
              {sizeError && (
                <p className="text-left pt-3 text-red-500 font-semibold text-xs">
                  {sizeError}
                </p>
              )}
            </div>

            {/* Select from Previous Section */}
            <div className="flex-1 w-full">
              <SelectImage
                previousImages={previousImages}
                setImage={setImage}
                tempImage={tempImage}
                setTempImage={setTempImage}
                dbImageUrl={dbImageUrl}
                isOpen={isOpen}
                onOpen={onOpen}
                onOpenChange={onOpenChange}
                axiosSecure={axiosSecure}
                refetch={refetch}
                setSizeError={setSizeError}
              />
            </div>
          </div>

          {/* Preview Selected Image */}
          {image && (
            <div className="relative rounded-xl border border-gray-200">
              <Image
                src={image.src}
                alt="Uploaded image preview"
                height={3000}
                width={3000}
                className="w-full h-[250px] object-contain bg-white rounded-xl"
              />
              <button
                type='button'
                onClick={handleImageRemove}
              >
                <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={`flex ${image?.src ? "justify-between" : "justify-end"} items-center`}>

          {shouldShowPreview &&
            <button type='button' className='text-blue-600 font-bold border-b border-blue-500' onClick={() => handleGoToPreviewPageBeforeUpload(image.src, selectedPosition)}>
              Preview
            </button>
          }

          <button
            type='submit'
            className={`bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 py-2 px-4 text-sm rounded-lg cursor-pointer font-bold transition-[background-color] duration-300`}
          >
            Update
          </button>
        </div>

      </form>

    </div>
  );
};

export default MarketingBanner;