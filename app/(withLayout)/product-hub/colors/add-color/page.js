"use client";
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
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

const AddColor = () => {
  const axiosPublic = useAxiosPublic();
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
      const response = await axiosPublic.post('/addColor', colorData);
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
    } catch (error) {
      toast.error('Failed to add colors. Please try again!');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='relative px-6 bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>CREATE NEW COLORS</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/colors"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='max-w-screen-xl mx-auto'>
        <div className="mt-8 w-full bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg">
          <label className="flex justify-start font-medium text-[#9F5216] pb-2">Select Color</label>
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
                    className="w-16 h-16 p-0 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Enter color name"
                    {...register(`colors.${index}.colorName`, { required: 'Color name is required' })}
                    className="p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md w-full"
                  />
                </div>
                <Button type="button" color="danger" onClick={() => removeColor(index)} variant="light">
                  Remove
                </Button>
              </div>
              {errors.colors?.[index]?.colorCode && (
                <p className="text-red-600 text-left">{errors.colors[index].colorCode.message}</p>
              )}
              {errors.colors?.[index]?.colorName && (
                <p className="text-red-600 text-left">{errors.colors[index].colorName.message}</p>
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