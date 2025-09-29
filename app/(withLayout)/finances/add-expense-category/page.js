"use client";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { Button } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const AddExpenseCategory = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [wantsSubCategory, setWantsSubCategory] = useState(null); // null | true | false
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [subCategoryError, setSubCategoryError] = useState("");
  const inputRefSubCategory = useRef(null);

  const [wantsSubSubCategory, setWantsSubSubCategory] = useState(null); // null | true | false
  const [subSubCategoriesMap, setSubSubCategoriesMap] = useState({});
  const [subSubCategoryInputs, setSubSubCategoryInputs] = useState({});
  const [subSubCategoryError, setSubSubCategoryError] = useState({});
  const inputRefSubSubCategory = useRef(null);

  // Handle input change for sub-categories
  const handleSubCategoryInputChange = (value) => {
    setSubCategoryInput(value);
  };

  // Add sub-category
  const addSubCategory = (subCategory) => {
    if (!subCategory || !subCategory.trim()) return;

    const trimmed = subCategory.trim();

    // Check for duplicate (case-insensitive)
    if (selectedSubCategories.some(sc => sc.toLowerCase() === trimmed.toLowerCase())) {
      setSubCategoryError(`"${trimmed}" already exists`);
      return;
    }

    // Add new sub-category
    setSelectedSubCategories((prev) => [...prev, trimmed]);
    setSubCategoryInput('');
    setSubCategoryError('');
  };

  // Add sub-category manually
  const handleAddSubCategory = () => {
    addSubCategory(subCategoryInput);
  };

  // Remove sub-category
  const handleSubCategoryRemove = (indexToRemove) => {
    setSelectedSubCategories(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Handle typing in a specific sub-category input
  const handleSubSubCategoryInputChange = (subCategory, value) => {
    setSubSubCategoryInputs((prev) => ({
      ...prev,
      [subCategory]: value
    }));
  };

  const handleAddSubSubCategory = (subCategory) => {
    const inputValue = (subSubCategoryInputs[subCategory] || "").trim();
    if (!inputValue) return;

    // Check for duplicate (case-insensitive)
    if ((subSubCategoriesMap[subCategory] || []).some(ssc => ssc.toLowerCase() === inputValue.toLowerCase())) {
      setSubSubCategoryError(prev => ({
        ...prev,
        [subCategory]: `"${inputValue}" already exists for "${subCategory}"`
      }));
      return;
    }

    // Add sub-sub-category
    setSubSubCategoriesMap(prev => ({
      ...prev,
      [subCategory]: [...(prev[subCategory] || []), inputValue]
    }));

    // Clear input and error
    setSubSubCategoryInputs(prev => ({ ...prev, [subCategory]: "" }));
    setSubSubCategoryError(prev => ({ ...prev, [subCategory]: "" }));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Validate sub-categories
    if (wantsSubCategory) {
      if (selectedSubCategories.length === 0) {
        setSubCategoryError("Please add at least one sub-category.");
        setIsSubmitting(false);
        return;
      };
    }

    // Validate sub-sub-categories for each sub-category if the user wants to add them
    if (wantsSubCategory && wantsSubSubCategory) {
      for (let subCat of selectedSubCategories) {
        if (!subSubCategoriesMap[subCat] || subSubCategoriesMap[subCat].length === 0) {
          setSubSubCategoryError(prev => ({
            ...prev,
            [subCat]: `Please add at least one sub-sub-category for "${subCat}"`
          }));
          setIsSubmitting(false);
          return;
        }
      }
    };

    const expenseCategoryData = {
      expenseCategory: data.expenseCategory,
      subCategories: wantsSubCategory
        ? selectedSubCategories.map(subCat => ({
          name: subCat,
          subSubCategories: wantsSubSubCategory ? (subSubCategoriesMap[subCat] || []) : []
        }))
        : []
    };

    try {
      // Submit expense category data
      const response = await axiosSecure.post('/add-expense-category', expenseCategoryData);

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
                    New Expense Category Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Expense Category has been added successfully!
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

        // Redirect after successful submission
        router.push("/finances");
      } else {
        throw new Error('Failed to add expense category');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense category. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset submit state at the end of submission
    }
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Expense Category Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/finances"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-2 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>
            <label className="flex justify-start font-semibold text-neutral-500 text-sm">Expense Category <span className="text-red-600 pl-1">*</span></label>
            <input
              type="text"
              placeholder="Add Expense Category"
              {...register('expenseCategory', { required: 'Expense Category is required' })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
            />
            {errors.expenseCategory && (
              <p className="text-left text-red-500 font-semibold text-xs">{errors.expenseCategory.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-4 bg-white drop-shadow p-5 md:p-7 rounded-lg'>
            <Button
              type="button"
              onPress={() => setWantsSubCategory((prev) => !prev)}
              className="px-4 py-2 bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700 font-semibold rounded-lg w-fit"
            >
              {wantsSubCategory ? "Hide Sub-Categories" : "+ Add Sub-Category"}
            </Button>
            {wantsSubCategory &&
              <div className='flex flex-col gap-4'>

                <div className="w-full" ref={inputRefSubCategory}>
                  <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Sub-Category <span className="text-red-600 pl-1">*</span></label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add or Search Sub-Category"
                      value={subCategoryInput}
                      onChange={(e) => {
                        handleSubCategoryInputChange(e.target.value);
                        setSubCategoryError(''); // clear error while typing
                      }}
                      className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                    />
                    <Button
                      type="button"
                      onPress={handleAddSubCategory}
                      disabled={!subCategoryInput}
                      className={`px-5 py-3 rounded-md font-semibold ${subCategoryInput ? 'bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      Add Sub-Category
                    </Button>
                  </div>

                  {subCategoryError && (
                    <p className="text-left pt-1 text-red-500 font-semibold text-xs">{subCategoryError}</p>
                  )}

                </div>

                {/* Selected sub-categories */}
                <div className="selected-subCategories flex flex-wrap gap-3">
                  {selectedSubCategories?.map((subCategory, index) => (
                    <div key={index} className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700 mb-8">
                      <span>{subCategory}</span>
                      <button
                        type="button"
                        onClick={() => handleSubCategoryRemove(index)}
                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                      >
                        <RxCross2 size={19} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            }
          </div>

          {wantsSubCategory && selectedSubCategories.length > 0 && (
            <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
              <Button
                type="button"
                onPress={() => setWantsSubSubCategory((prev) => !prev)}
                className="px-4 py-2 bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 font-semibold rounded-lg w-fit"
              >
                {wantsSubSubCategory ? "Hide Sub-Sub-Categories" : "+ Add Sub-Sub-Category"}
              </Button>
              {wantsSubCategory && wantsSubSubCategory && selectedSubCategories?.map((subCategory) => (
                <div key={subCategory} className='flex flex-col gap-4'>

                  <div className="w-full" ref={inputRefSubSubCategory}>
                    <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                      Add Sub-Sub-Categories for <span className="text-neutral-700 pl-1">{subCategory}</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Add Sub-Sub-Category under ${subCategory}`}
                        value={subSubCategoryInputs[subCategory] || ""}
                        onChange={(e) => {
                          handleSubSubCategoryInputChange(subCategory, e.target.value);
                          setSubSubCategoryError(prev => ({ ...prev, [subCategory]: "" })); // clear error for this sub-category only
                        }}
                        className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                      />
                      <Button
                        type="button"
                        onPress={() => handleAddSubSubCategory(subCategory)}
                        disabled={!subSubCategoryInputs[subCategory]}
                        className={`px-5 py-3 rounded-md font-semibold ${subSubCategoryInputs[subCategory] ? 'bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Add Sub-Sub-Category
                      </Button>
                    </div>

                    {subSubCategoryError[subCategory] && (
                      <p className="text-left pt-1 text-red-500 font-semibold text-xs">
                        {subSubCategoryError[subCategory]}
                      </p>
                    )}

                  </div>

                  {/* Selected sub-sub-categories */}
                  <div className="selected-subCategories flex flex-wrap gap-3">
                    {subSubCategoriesMap[subCategory]?.map((subSubCategory, i) => (
                      <div key={i} className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700 mb-8">
                        <span>{subSubCategory}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSubSubCategoriesMap((prev) => ({
                              ...prev,
                              [subCategory]: prev[subCategory].filter((_, idx) => idx !== i)
                            }));
                          }}
                          className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                        >
                          <RxCross2 size={19} />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}

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

export default AddExpenseCategory;