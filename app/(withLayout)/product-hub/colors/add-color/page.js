"use client";
import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import { RxCheck, RxCross2 } from "react-icons/rx";
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdOutlineFileUpload } from 'react-icons/md';
import { FiPlus } from 'react-icons/fi';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const AddColor = () => {
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      colors: [{ colorName: '', colorCode: '#FFFFFF', colorFormat: 'Hex' }]
    }
  });

  // UseFieldArray for handling multiple colors
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: 'colors'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const colorData = data.colors.map(color => ({
      value: color.colorName,
      label: color.colorName,
      color: color.colorCode
    }));


    try {
      const response = await axiosSecure.post('/api/color/add', colorData);
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
                    New Color Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Color has been added successfully!
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
        reset();
        router.push("/product-hub/colors")
      }
    } catch (err) {
      // Check if it's an Axios error with response
      if (err.response?.data?.error?.message) {
        try {
          // Zod errors are usually JSON strings, parse them
          const zodErrors = JSON.parse(err.response.data.error.message);

          // Iterate over each error and show toast
          zodErrors.forEach(e => {
            toast.error(`${e.path.join(".")}: ${e.message}`);
          });
        } catch (parseErr) {
          // If parsing fails, fallback to showing raw message
          toast.error(err.response.data.error.message);
        }
      } else {
        toast.error("Failed to add color");
      }
    } finally {
      setIsSubmitting(false); // Reset submit state at the end of submission
    }
  };

  return (
    <div className='relative px-6 bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>CREATE NEW COLORS</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/colors"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='max-w-screen-xl mx-auto'>
        <div className="mt-8 w-full bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg">
          <label htmlFor='colors' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select Color <span className="text-red-600 pl-1">*</span></label>
          {colorFields.map((item, index) => (
            <div key={item.id} className="flex flex-col mb-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className='flex flex-1 items-center gap-4'>
                  <input
                    type="color"
                    {...register(`colors.${index}.colorCode`, {
                      required: 'Color code is required',
                      validate: value => value !== '#FFFFFF' || 'Please select a color other than the default white'
                    })}
                    className="w-12 h-12 p-0 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Enter color name"
                    {...register(`colors.${index}.colorName`, { required: 'Color name is required' })}
                    className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  />
                </div>
                <Button type="button" color="danger" onPress={() => removeColor(index)} variant="light">
                  Remove
                </Button>
              </div>
              {errors.colors?.[index]?.colorCode && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.colors[index].colorCode.message}</p>
              )}
              {errors.colors?.[index]?.colorName && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.colors[index].colorName.message}</p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendColor({ colorName: '', colorCode: '#FFFFFF' })}
            className="mt-4 mb-8 bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700 py-2 px-4 text-sm rounded-md cursor-pointer font-semibold flex items-center gap-2"
          >
            <FiPlus size={18} /> Add Color
          </button>
        </div>
        <div className='flex justify-end items-center my-8'>
          <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}>
            <MdOutlineFileUpload size={20} /> {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default AddColor;