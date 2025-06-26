"use client";
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import useHeroBannerImages from '@/app/hooks/useHeroBannerImages';
import { useAuth } from '@/app/contexts/auth';
import { Slider } from '@nextui-org/react';
import Loading from '../../shared/Loading/Loading';
import CustomSwitch from '../../shared/switch/CustomSwitch';
import LeftSlides from './LeftSlides';
import CenterSlides from './CenterSlides';
import RightSlides from './RightSlides';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const currentModule = "Settings";

const HomepageContent = () => {

  const { handleSubmit, control, setValue, formState: { errors } } = useForm();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [heroBannerImageList = [], isLoginRegisterHeroBannerImagePending, refetch] = useHeroBannerImages();
  const [image, setImage] = useState([]);
  const [image2, setImage2] = useState([]);
  const [image3, setImage3] = useState([]);
  const [sizeError, setSizeError] = useState("");
  const [sizeError2, setSizeError2] = useState("");
  const [sizeError3, setSizeError3] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dragging2, setDragging2] = useState(false);
  const [dragging3, setDragging3] = useState(false);
  const [status, setStatus] = useState(false);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";

  useEffect(() => {
    if (heroBannerImageList && heroBannerImageList.length > 0) {
      setImage(heroBannerImageList[0]?.sliders?.leftSlides);
      setImage2(heroBannerImageList[0]?.sliders?.centerSlides);
      setImage3(heroBannerImageList[0]?.sliders?.rightSlides);
      setStatus(heroBannerImageList[0]?.isEnabled);
      setValue("slideInterval", heroBannerImageList[0]?.slideInterval);
    }
  }, [heroBannerImageList, setValue]);

  const handleGoToPreviewPageAfterUpload = (imageUrl, imageUrl2, imageUrl3) => {
    // const previewURL = `/preview/previewHomeContent?leftImage=${encodeURIComponent(imageUrl)}&centerImage=${encodeURIComponent(imageUrl2)}&rightImage=${encodeURIComponent(imageUrl3)}`;
    // window.open(previewURL, '_blank');
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.checked); // true or false
  };

  const onSubmit = async (data) => {

    if (!image || image.length === 0) {
      setSizeError("Please upload at least one image for left slide.");
      return;
    }
    setSizeError("");

    if (!image2 || image2.length === 0) {
      setSizeError2("Please upload at least one image for center slide.");
      return;
    }
    setSizeError2("");

    if (!image3 || image3.length === 0) {
      setSizeError3("Please upload at least one image for right slide.");
      return;
    }
    setSizeError3("");

    const interval = parseFloat(data.slideInterval);

    // ✅ Validate slideInterval if slide is enabled
    if (status && (interval === 0 || isNaN(interval))) {
      toast.error("Interval is required when slide is enabled.");
      return;
    }

    if (heroBannerImageList?.length > 0) {
      const bannerId = heroBannerImageList[0]?._id;

      const bannerData = {
        isEnabled: status,
        slideInterval: status ? interval : 0,
        sliders: {
          leftSlides: image,
          centerSlides: image2,
          rightSlides: image3,
        }
      };

      try {
        const response = await axiosSecure.put(`/editHeroBannerImageUrls/${bannerId}`, bannerData);
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
                      Hero banner updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Hero banner has been successfully updated!
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

  if (isLoginRegisterHeroBannerImagePending || isUserLoading) {
    return <Loading />
  };

  return (
    <div className='max-w-screen-sm mx-auto'>

      {isAuthorized && (

        <form onSubmit={handleSubmit(onSubmit)} className='py-6'>

          <div className='flex flex-col gap-4 mb-6'>

            <div className="flex-1 w-full font-semibold flex items-center gap-4">
              <label className='text-sm'>{status ? "Disable Slide" : "Enable Slide"}</label>
              <CustomSwitch checked={status} onChange={handleStatusChange} />
            </div>

            {/* Slide Interval */}
            <Controller
              name="slideInterval"
              control={control}
              rules={{ required: true }}
              defaultValue={1}
              render={({ field }) => (
                <div className="w-full pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="slideInterval" className="text-sm text-neutral-800 font-bold">
                      Slide Interval (seconds) *
                    </label>
                    <span className="text-sm text-neutral-500 font-bold">
                      {`${field.value?.toFixed(2)} s`}
                    </span>
                  </div>
                  <Slider
                    id="slideInterval"
                    minValue={1}
                    maxValue={5}
                    step={0.50}
                    aria-label="Slide Interval"
                    className="w-full"
                    {...field}
                  />
                  {errors.slideInterval && (
                    <p className="text-red-600 text-left pt-2 text-sm">
                      Slide Interval is required
                    </p>
                  )}
                </div>
              )}
            />

          </div>

          <div className='flex flex-col w-full rounded-lg gap-4 xl:gap-8'>

            <LeftSlides image={image} setImage={setImage} setSizeError={setSizeError} sizeError={sizeError} axiosPublic={axiosPublic} dragging={dragging} setDragging={setDragging} />

            <CenterSlides image2={image2} setImage2={setImage2} setSizeError2={setSizeError2} sizeError2={sizeError2} axiosPublic={axiosPublic} dragging2={dragging2} setDragging2={setDragging2} />

            <RightSlides image3={image3} setImage3={setImage3} setSizeError3={setSizeError3} sizeError3={sizeError3} axiosPublic={axiosPublic} dragging3={dragging3} setDragging3={setDragging3} />

          </div>

          {/* Submit Button */}
          <div className="flex justify-between gap-6 items-center mt-6 pb-6">

            {heroBannerImageList?.map((hero) => (
              <button key={hero?._id} type='button' className='text-blue-600 border-blue-500 font-bold border-b' onClick={() => handleGoToPreviewPageAfterUpload(hero?.leftImgUrl, hero?.centerImgUrl, hero?.rightImgUrl)}>
                Preview
              </button>
            ))}

            <button
              type='submit'
              className={`bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 py-2 px-4 text-sm rounded-lg cursor-pointer font-bold transition-[background-color] duration-300`}
            >
              Upload
            </button>

          </div>

        </form>

      )}

    </div>
  );
};

export default HomepageContent;