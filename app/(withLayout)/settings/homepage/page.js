"use client";
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa6';
import useTopHeader from '@/app/hooks/useTopHeader';
import { Slider } from '@nextui-org/react';
import CustomSwitch from '@/app/components/shared/switch/CustomSwitch';
import HomepageContent from '@/app/components/settings/home/HomepageContent';
import TabsForSettings from '@/app/components/settings/tabs/TabsForSetting';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const HomepageSettings = () => {

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: { slides: [{ slideText: "", optionalLink: "" }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "slides" });
  const [activeTab, setActiveTab] = useState('Top Header Settings');
  const tabs = ["Top Header Settings", "Homepage Content"];
  const [slideEnabled, setSlideEnabled] = useState(false);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(false);
  const [highlightedColorEnabled, setHighlightedColorEnabled] = useState(false);
  const [topHeaderList, isTopHeaderPending, refetch] = useTopHeader();
  const axiosSecure = useAxiosSecure();

  // Ensure the code runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTabHomepageSettings');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTabHomepageSettings', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (topHeaderList && topHeaderList.length > 0) {

      setSlideEnabled(topHeaderList[0]?.isSlideEnabled);
      setAutoSlideEnabled(topHeaderList[0]?.isAutoSlideEnabled);
      setHighlightedColorEnabled(topHeaderList[0]?.isHighlightedColorEnabled);
      setValue('topHeaderColor', topHeaderList[0]?.topHeaderColor);
      setValue('textColor', topHeaderList[0]?.textColor);
      setValue('highlightedTextColor', topHeaderList[0]?.highlightedTextColor);
      setValue('slideDuration', topHeaderList[0]?.slideDuration);

      if (topHeaderList[0]?.slides?.length > 0) {
        setValue('slides', topHeaderList[0].slides);
      }
    }
  }, [topHeaderList, setValue]);

  const onSubmit = async (data) => {

    // ✅ Check if slide is enabled but no slides provided
    if (slideEnabled && (!data.slides || data.slides.length === 0)) {
      toast.error("Please add at least one slide before submitting.");
      return; // ❌ Stop submission
    }

    if (topHeaderList?.length > 0) {
      const topHeaderId = topHeaderList[0]?._id;

      try {

        const topHeaderInformation = {
          isSlideEnabled: slideEnabled,
          isAutoSlideEnabled: autoSlideEnabled,
          isHighlightedColorEnabled: highlightedColorEnabled,
          highlightedTextColor: highlightedColorEnabled ? data.highlightedTextColor : "",
          topHeaderColor: slideEnabled ? data.topHeaderColor : "",
          textColor: slideEnabled ? data.textColor : "",
          slideDuration: slideEnabled ? parseFloat(data.slideDuration) : null,
          slides: slideEnabled ? data.slides : [],
        }

        const response = await axiosSecure.put(`/update-top-header/${topHeaderId}`, topHeaderInformation);

        if (response.data.modifiedCount > 0) {

          // ✅ Show success toast if the invitation is successfully sent
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
                      Top Header settings updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Your changes have been saved and applied to the top header section.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
                >
                  <RxCross2 />
                </button>
              </div>
            </div>
          ), {
            position: "bottom-right",
            duration: 5000
          });
          refetch();

        } else {

          // ⚠️ Handle the case where no changes detected!
          toast.custom((t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
            >
              <div className="pl-6">
                <RxCross2 className="h-6 w-6 bg-yellow-500 text-white rounded-full" />
              </div>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-base font-bold text-gray-900">
                      No changes detected
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      You have not made any updates to the top header settings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
                >
                  <RxCross2 />
                </button>
              </div>
            </div>
          ), {
            position: "bottom-right",
            duration: 5000
          });
        }

      } catch (error) {

        // ❌ Show error toast when something goes wrong
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
          >
            <div className="pl-6">
              <RxCross2 className="h-6 w-6 bg-red-500 text-white rounded-full" />
            </div>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-base font-bold text-gray-900">
                    Top header setting failed to update
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Something went wrong while saving your changes. Please try again later.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        ), {
          position: "bottom-right",
          duration: 5000
        });

      }

    };
  };

  if (isTopHeaderPending) return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative px-6 md:px-10'>

      <div className="bg-gray-50 sticky top-0 z-10 max-w-screen-sm mx-auto">

        <h1 className="font-bold text-lg md:text-xl lg:text-3xl text-neutral-700 py-1 2xl:py-3 bg-gray-50">HOMEPAGE SETTINGS</h1>

        <TabsForSettings tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      </div>

      {activeTab === "Top Header Settings" &&
        <div className='pt-4 max-w-screen-sm mx-auto pb-6'>

          <div className='flex flex-col mt-3'>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>

              {/* Slide Enable/Disable */}
              <div className='w-full font-semibold flex items-center gap-4'>
                <label className='text-sm'>{slideEnabled ? "Disable Top Header" : "Enable Top Header"}</label>
                <CustomSwitch
                  checked={slideEnabled}
                  onChange={() => setSlideEnabled(prev => !prev)}
                  size="md"
                  color="primary"
                />
              </div>

              {slideEnabled && (
                <div className='space-y-4'>

                  {/* Slide Enable/Disable */}
                  <div className='w-full font-semibold flex items-center gap-4'>
                    <label className='text-sm'>{autoSlideEnabled ? "Disable Auto Slide" : "Enable Auto Slide"}</label>
                    <CustomSwitch
                      checked={autoSlideEnabled}
                      onChange={() => setAutoSlideEnabled(prev => !prev)}
                      size="md"
                      color="primary"
                    />
                  </div>

                  {/* Highlighted Slide Enable/Disable */}
                  <div className='w-full font-semibold flex items-center gap-4'>
                    <label className='text-sm'>{highlightedColorEnabled ? "Disable Highlighted Color" : "Enable Highlighted Color"}</label>
                    <CustomSwitch
                      checked={highlightedColorEnabled}
                      onChange={() => setHighlightedColorEnabled(prev => !prev)}
                      size="md"
                      color="primary"
                    />
                  </div>

                  {highlightedColorEnabled &&
                    /* Highlight Text Color Selection */
                    <div className="w-full font-semibold flex items-center gap-4">
                      <label htmlFor="highlightedTextColor" className='text-sm'>Highlighted Text Color</label>
                      <input
                        type="color"
                        {...register(`highlightedTextColor`, {
                          required: 'Color code is required',
                        })}
                        className=" p-0 border border-gray-300 rounded-md"
                      />
                    </div>
                  }

                  {/* Slide background Color */}
                  <div className="w-full font-semibold flex items-center gap-4">
                    <label htmlFor="topHeaderColor" className='text-sm'>Slide Background Color</label>
                    <input
                      type="color"
                      {...register(`topHeaderColor`, {
                        required: 'Color code is required',
                      })}
                      className=" p-0 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Slide Text Color Selection */}
                  <div className="w-full font-semibold flex items-center gap-4">
                    <label htmlFor="textColor" className='text-sm'>Slide Text Color</label>
                    <input
                      type="color"
                      {...register(`textColor`, {
                        required: 'Color code is required',
                      })}
                      className=" p-0 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Slide Duration */}
                  <Controller
                    name="slideDuration"
                    control={control}
                    rules={{ required: true }}
                    defaultValue={1.5}
                    render={({ field }) => (
                      <div className="w-full pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="slideDuration" className="text-sm text-neutral-800 font-bold">
                            Slide Duration (seconds) *
                          </label>
                          <span className="text-sm text-neutral-500 font-bold">
                            {`${field.value?.toFixed(2)} s`}
                          </span>
                        </div>
                        <Slider
                          id="slideDuration"
                          minValue={2}
                          maxValue={5}
                          step={0.50}
                          aria-label="Slide Duration"
                          className="w-full"
                          {...field}
                        />
                        {errors.slideDuration && (
                          <p className="text-red-600 text-left pt-2 text-sm">
                            Slide Duration is required
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <div className='pt-6 flex items-center justify-between'>
                    <h2 className='text-lg font-semibold'>Slides</h2>
                    <button type="button" onClick={() => append({ slideText: "", optionalLink: "" })} className="flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700">
                      Add <FaPlus size={16} />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 gap-4 w-full'>

                    {fields.map((item, index) => (

                      <div key={item.id} className="flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit">

                        {/* Slide Text */}
                        <div>
                          <input {...register(`slides.${index}.slideText`, { required: true })}
                            placeholder='Enter Slide Text *'
                            className="w-full border-b-2 border-neutral-300 bg-transparent py-2 text-neutral-800 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-neutral-400 text-sm"
                          />
                          {errors.slides?.[index]?.slideText && (
                            <p className="text-red-600 text-sm pt-2">Slide text is required</p>
                          )}
                        </div>

                        {/* Optional Link */}
                        <input {...register(`slides.${index}.optionalLink`)}
                          placeholder='Enter Optional Link'
                          className="w-full border-b-2 border-neutral-300 bg-transparent py-2 text-neutral-800 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-neutral-400 text-sm"
                          type="text"
                        />

                        {/* Remove Button */}
                        <div className='flex justify-end'>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className='cursor-pointer hover:bg-gray-50 p-3 rounded-full'
                          >
                            <RiDeleteBinLine size={20} />
                          </button>
                        </div>

                      </div>
                    ))}

                  </div>

                </div>
              )}

              {/* Submit Button */}
              <div className={`w-full flex justify-end !mt-7`}>

                <button
                  type='submit'
                  className="w-fit rounded-lg bg-[#d4ffce] px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[#bdf6b4] md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out"
                >
                  Save <FiSave size={19} />
                </button>
              </div>

            </form>
          </div>

        </div>
      }

      {activeTab === "Homepage Content" &&
        <div className='pt-4'>
          <HomepageContent />
        </div>
      }

    </div >
  );
};

export default HomepageSettings;