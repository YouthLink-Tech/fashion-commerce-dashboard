import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdCancel, MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { isValidImageFile } from '../../shared/upload/isValidImageFile';
import { FiSave } from 'react-icons/fi';
import useLogo from '@/app/hooks/useLogo';
import Loading from '../../shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const LogoSettings = () => {

  const axiosSecure = useAxiosSecure();
  const { handleSubmit } = useForm();
  const [image, setImage] = useState(null);
  const [sizeError, setSizeError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [image2, setImage2] = useState(null);
  const [sizeError2, setSizeError2] = useState("");
  const [dragging2, setDragging2] = useState(false);
  const [logoList, isLogoPending, refetch] = useLogo();

  useEffect(() => {
    if (logoList && logoList.length > 0) {
      setImage(logoList[0]?.desktopLogoUrl);
      setImage2(logoList[0]?.mobileLogoUrl);
    }
  }, [logoList]);

  const handleImageRemove = () => {
    setImage(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleImageRemove2 = () => {
    setImage2(null);
  };

  const handleDragOver2 = (event) => {
    event.preventDefault();
    setDragging2(true);
  };

  const handleDragLeave2 = () => {
    setDragging2(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage(uploadedImageUrl);
      setSizeError(false);
    }
  };

  const handleDrop2 = async (event) => {
    event.preventDefault();
    setDragging2(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage2(uploadedImageUrl);
      setSizeError2(false);
    }
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
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage(uploadedImageUrl);
      setSizeError(false);
    }
  };

  const handleImageChange2 = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage2(uploadedImageUrl);
      setSizeError2(false);
    }
  };

  const onSubmit = async () => {

    if (!image) {
      setSizeError("Please upload the desktop banner with text.");
      return;
    }
    setSizeError("");

    if (!image2) {
      setSizeError2("Please upload the mobile logo (logo only).");
      return;
    }
    setSizeError2("");

    if (logoList?.length > 0) {
      const logoId = logoList[0]?._id;

      const logoData = {
        desktopLogoUrl: image, // Image with text for desktop
        mobileLogoUrl: image2,   // Logo only for mobile
      };

      try {
        const response = await axiosSecure.put(`/api/logo/edit/${logoId}`, logoData);
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
                      Logo updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Logo has been successfully updated!
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
        toast.error("Failed to logo!");
      }

    }
  };

  if (isLogoPending) return <Loading />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='mt-3 flex flex-col gap-6'>

      <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

        <label htmlFor={`desktop-banner`} className="font-semibold">
          Desktop Banner (with Text) <span className="text-red-600">*</span>
        </label>
        <input
          id='imageUpload'
          type='file'
          className='hidden'
          onChange={handleImageChange}
        />
        <label
          htmlFor='imageUpload'
          className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-3 border-dashed border-neutral-200 hover:bg-blue-50 hover:border-blue-300 duration-1000 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
            } p-6 cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
            <p className="text-[11px] text-gray-500">Required size: 244 (W) x 72 (H)</p>
            <p className="text-[11px] text-amber-600 font-semibold">Transparent background</p>
          </div>
        </label>
        {sizeError && (
          <p className="text-left pt-1 text-red-500 font-semibold text-xs">Please upload the desktop banner with text.</p>
        )}
        {image && (
          <div className='relative mt-8'>
            <Image
              src={image}
              alt='Uploaded image'
              height={3000}
              width={3000}
              className='w-full min-h-[200px] max-h-[200px] rounded-md object-contain'
            />
            <button
              onClick={handleImageRemove}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
              type='button'
            >
              <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
            </button>
          </div>
        )}

      </div>

      <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

        <label htmlFor={`mobile-logo`} className="font-semibold">
          Mobile Logo (Only Logo) <span className="text-red-600">*</span>
        </label>
        <input
          id='imageUpload2'
          type='file'
          className='hidden'
          onChange={handleImageChange2}
        />
        <label
          htmlFor='imageUpload2'
          className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-3 border-dashed border-neutral-200 hover:bg-blue-50 hover:border-blue-300 duration-1000 ${dragging2 ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
            } p-6 cursor-pointer`}
          onDragOver={handleDragOver2}
          onDragLeave={handleDragLeave2}
          onDrop={handleDrop2}
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
            <p className="text-[11px] text-gray-500">Required size: 72 (W) x 72 (H)</p>
            <p className="text-[11px] text-amber-600 font-semibold">Transparent background</p>
          </div>
        </label>
        {sizeError2 && (
          <p className="text-left text-red-500 font-semibold text-xs pt-1">Please upload the mobile logo (logo only).</p>
        )}
        {image2 && (
          <div className='relative mt-8'>
            <Image
              src={image2}
              alt='Uploaded image'
              height={3000}
              width={3000}
              className='w-full min-h-[200px] max-h-[200px] rounded-md object-contain'
            />
            <button
              onClick={handleImageRemove2}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
              type='button'
            >
              <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
            </button>
          </div>
        )}

      </div>

      <div className='w-full flex justify-end mt-8'>
        <button type="submit" className='w-fit rounded-lg bg-[#d4ffce] px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[#bdf6b4] md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out'>
          Upload <FiSave size={19} />
        </button>
      </div>

    </form>
  );
};

export default LogoSettings;