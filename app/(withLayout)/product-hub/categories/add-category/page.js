"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@nextui-org/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdOutlineFileUpload } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa6';
import useCategories from '@/app/hooks/useCategories';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const defaultImages = ["https://i.ibb.co.com/ZJ2Qy29/2892174.png",
  "https://i.ibb.co.com/dcRM6Fz/88768.png",
  "https://i.ibb.co.com/sm3xZHL/pngtree-shoes-icon-design-template-illustration-png-image-3177407-removebg-preview.png",
  "https://i.ibb.co.com/yFVrMHF/664466.png",
  "https://i.ibb.co.com/khrPqNc/3345358.png",
  "https://i.ibb.co.com/F7qy9Gh/5258035.png"];

const AddCategory = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryList, isCategoryPending] = useCategories();
  const [selectedDefaultImage, setSelectedDefaultImage] = useState(null);
  const [sizeInput, setSizeInput] = useState('');
  const [filteredSizes, setFilteredSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [fetchedSizes, setFetchedSizes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [fetchedSubCategories, setFetchedSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const [sizeImages, setSizeImages] = useState({});

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRefCategory = useRef(null);
  const suggestionsRefCategory = useRef(null);

  useEffect(() => {
    const allSizes = [];
    const images = {};
    const allSubCategories = [];

    categoryList?.forEach(category => {
      // Collect unique sizes
      category.sizes.forEach(size => {
        if (!allSizes.includes(size)) {
          allSizes.push(size);
        }
      });
      // Collect images
      Object.assign(images, category.sizeImages);
      // Collect subcategories
      category.subCategories.forEach(sub => {
        if (!allSubCategories.includes(sub.label)) {
          allSubCategories.push(sub.label);
        }
      });
    });

    setFetchedSizes(allSizes);
    setSizeImages(images);
    setFetchedSubCategories(allSubCategories); // Set the state with fetched subcategories
  }, [categoryList]);

  // Close suggestions if clicking outside the input or suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close suggestions if clicking outside the input or suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRefCategory.current &&
        !inputRefCategory.current.contains(event.target) &&
        suggestionsRefCategory.current &&
        !suggestionsRefCategory.current.contains(event.target)
      ) {
        setShowSubCategorySuggestions(false); // Close sub-category suggestions
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 10MB.');
      return;
    }

    setImage({
      src: URL.createObjectURL(file),
      file
    });
    setSelectedDefaultImage(null);
  };

  const handleImageRemove = () => {
    setImage(null);
    setSelectedDefaultImage(null); // Clear image selection
  };

  const handleDefaultImageSelect = (defaultImage) => {
    setSelectedDefaultImage(defaultImage);
    setImage(null); // Clear uploaded image if a default image is selected
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

  const uploadImageToGCS2 = async (image) => {
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

  // Handle input change for sub-categories
  const handleSubCategoryInputChange = (value) => {
    setSubCategoryInput(value);
    const filtered = fetchedSubCategories
      .filter(subCategory => subCategory.toLowerCase().includes(value.toLowerCase()))
      .filter(subCategory => !selectedSubCategories.includes(subCategory)); // Exclude already selected

    setFilteredSubCategories(filtered);
  };

  // Focus handler for sub-category input
  const handleSubCategoryInputFocus = () => {
    const filtered = fetchedSubCategories
      .filter(subCategory => !selectedSubCategories.includes(subCategory)); // Exclude already selected
    setFilteredSubCategories(filtered);
    setShowSubCategorySuggestions(true); // Show suggestions when input is focused
  };

  // Add sub-category
  const addSubCategory = (subCategory) => {
    if (!subCategory || !subCategory.trim()) return;
    if (selectedSubCategories.includes(subCategory)) return;

    setSelectedSubCategories(prev => [...prev, subCategory]);
    setSubCategoryInput('');
    setFilteredSubCategories([]);
  };

  // Add sub-category manually
  const handleAddSubCategory = () => {
    addSubCategory(subCategoryInput);
  };

  // Select from suggestions
  const handleSubCategorySelect = (subCategory) => {
    addSubCategory(subCategory);
    setShowSubCategorySuggestions(false);
  };

  // Remove sub-category
  const handleSubCategoryRemove = (indexToRemove) => {
    setSelectedSubCategories(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Function to handle input change and filter suggestions
  const handleSizeInputChange = (value) => {
    setSizeInput(value);
    const filtered = fetchedSizes
      .filter(size => size.toLowerCase().includes(value.toLowerCase()))
      .filter(size => !selectedSizes.includes(size)); // Exclude already selected sizes

    setFilteredSizes(filtered);
  };

  // Function to show suggestions when the input is focused
  const handleInputFocus = () => {
    const filtered = fetchedSizes
      .filter(size => !selectedSizes.includes(size)); // Exclude already selected sizes
    setFilteredSizes(filtered);
    setShowSuggestions(true); // Show suggestions when input is focused
  };

  // Function to validate and add a size (both typed or selected)
  const addSize = (size) => {
    if (!size || !size.trim()) return; // Prevent empty inputs
    if (selectedSizes.includes(size)) return; // Prevent duplicate sizes

    setSelectedSizes(prev => [...prev, size]);
    setSizeInput(''); // Clear input after adding
    setFilteredSizes([]); // Clear suggestions
  };

  // Add manually typed size
  const handleAddSize = () => {
    addSize(sizeInput); // Use the common function for validation and addition
  };

  // Select from suggestion list
  const handleSizeSelect = (size) => {
    addSize(size); // Use the common function for validation and addition
    setShowSuggestions(false); // Hide suggestions after selecting
  };

  // Remove size from the list
  const handleSizeRemove = (indexToRemove) => {
    setSelectedSizes(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleImageChangeForSizeRange = (size, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 10MB.');
      return;
    }

    setSizeImages(prev => ({
      ...prev,
      [size]: {
        src: URL.createObjectURL(file),
        file,
      }
    }));
  };

  const handleImageRemoveForSizeRange = (size) => {
    setSizeImages(prev => {
      const updatedImages = { ...prev };
      delete updatedImages[size]; // remove the image for the specific size
      return updatedImages;
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const { category } = data;

    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImageToGCS2(image);
      if (!imageUrl) {
        toast.error('Image upload failed, cannot proceed.');
        setIsSubmitting(false); // Reset submit state
        return;
      }
    } else if (selectedDefaultImage) {
      imageUrl = selectedDefaultImage; // Use selected default image if no image is uploaded
    } else {
      toast.error('You must select or upload an image.');
      setIsSubmitting(false); // Reset submit state
      return;
    }

    const updatedSizeImages = {};

    // Validate and handle size guide images
    for (const size of selectedSizes) {
      const imageData = sizeImages[size];

      if (!imageData) {
        // If no size guide image exists for the selected size, show an error
        toast.error(`Size guide image is required for size ${size}.`);
        setIsSubmitting(false); // Reset submit state
        return;
      }

      if (typeof imageData === 'string') {
        // Image is already a URL, just use it
        updatedSizeImages[size] = imageData;
      } else if (imageData?.file) {
        // Image is a new file, upload it
        try {
          const uploadedImageUrl = await uploadSingleFileToGCS(imageData.file);

          if (!uploadedImageUrl) {
            toast.error(`Image upload failed for size ${size}.`);
            setIsSubmitting(false);
            return;
          }

          updatedSizeImages[size] = uploadedImageUrl;  // Save the new image URL
        } catch (error) {
          console.error(`Error uploading image for size ${size}:`, error);
          toast.error(`Image upload failed for size ${size}, cannot proceed.`);
          setIsSubmitting(false);
          return;
        }
      } else {
        console.warn(`No file to upload for size ${size}`);
      }
    }

    // Validate selected sizes
    if (selectedSizes.length === 0) {
      toast.error('You must select at least one size.');
      setIsSubmitting(false); // Reset submit state
      return;
    }

    // Validate subCategories (if required)
    if (selectedSubCategories.length === 0) {
      toast.error('You must select at least one sub-category.');
      setIsSubmitting(false); // Reset submit state
      return;
    }

    const formattedSubCategories = selectedSubCategories.map((subCategory) => ({
      key: subCategory,
      label: subCategory,
    }));

    const categoryData = {
      key: category,
      label: category,
      sizes: selectedSizes,
      sizeImages: updatedSizeImages, // Updated size images
      subCategories: formattedSubCategories,
      imageUrl,
    };

    // Submit category data
    try {
      const response = await axiosSecure.post('/addCategory', categoryData);

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
                    New Category Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Category has been added successfully!
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
        router.push("/product-hub/categories");
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category or sizes. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset submit state at the end of submission
    }
  };

  if (isCategoryPending) {
    return <Loading />
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>Category Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/categories"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>
            <div>
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Category</label>
              <input
                type="text"
                placeholder="Add Category"
                {...register('category', { required: 'Category is required' })}
                className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
              />
              {errors.category && (
                <p className="text-red-600 text-left">{errors.category.message}</p>
              )}
            </div>

            {/* Size input field with improved styling */}
            <div className="w-full" ref={inputRef}>
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Size Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Add or Search Size Range (e.g., XXS-6XL)"
                  value={sizeInput}
                  onFocus={handleInputFocus}
                  onChange={(e) => handleSizeInputChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9F5216] focus:border-transparent transition duration-300 ease-in-out"
                />
                <Button
                  type="button"
                  onPress={handleAddSize}
                  disabled={!sizeInput}
                  className={`px-4 py-2 rounded-md font-semibold ${sizeInput ? 'bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Add Size
                </Button>
              </div>

              {/* Display filtered size suggestions with a dropdown-like design */}
              {showSuggestions && filteredSizes.length > 0 && (
                <ul ref={suggestionsRef} className="w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto z-[9999]">
                  {filteredSizes.map((size, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors duration-150 flex items-center gap-2"
                      onClick={() => handleSizeSelect(size)}
                    >
                      {/* Show the image next to the size */}
                      {sizeImages[size] && (
                        <Image
                          src={sizeImages[size]}
                          alt={`${size} size guide`}
                          height={3000} // Adjust size as needed
                          width={3000} // Adjust size as needed
                          className="rounded-md h-12 w-12 object-contain"
                        />
                      )}
                      <span>{size}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Display selected sizes with a more polished look */}
            <div className="selected-sizes flex flex-wrap gap-3">
              {selectedSizes?.map((size, index) => (
                <div key={index} className="flex flex-col items-start gap-2 bg-gray-100 border border-gray-300 rounded-md p-3">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-sm font-bold text-gray-700">{size}</span>
                    <button
                      type="button"
                      onClick={() => handleSizeRemove(index)}
                      className="ml-2 text-red-600 hover:text-red-900 focus:outline-none transition-colors duration-300 hover:scale-105"
                    >
                      <RxCross2 size={22} />
                    </button>
                  </div>

                  {/* Image upload input - Only show this if there is no image for the selected size */}
                  {!sizeImages[size] || (!sizeImages[size]?.src && typeof sizeImages[size] !== 'string') ? (
                    <>
                      {/* Image upload input field */}
                      <input
                        id={`imageUpload-${size}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChangeForSizeRange(size, e)} // Handle image upload
                      />
                      <label
                        htmlFor={`imageUpload-${size}`}
                        className="mx-auto flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-gray-400 p-6 bg-white cursor-pointer"
                      >
                        <MdOutlineFileUpload size={60} />
                        <div className="space-y-1.5 text-center">
                          <h5 className="whitespace-nowrap text-lg font-medium tracking-tight">
                            Upload Size Guide Image
                          </h5>
                          <p className="text-sm text-gray-500">
                            Photo should be in PNG, JPEG, or JPG format
                          </p>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div className="relative">
                      {/* Show the uploaded size guide image */}
                      <Image
                        src={typeof sizeImages[size] === 'string' ? sizeImages[size] : sizeImages[size].src}
                        alt={`${size} size guide`}
                        height={2000} // Adjust height
                        width={2000} // Adjust width
                        className="h-44 w-44 rounded-lg object-contain"
                      />

                      {/* Show "X" icon to allow removal of the image */}
                      <button
                        onClick={() => handleImageRemoveForSizeRange(size)} // Remove the image
                        className="absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        <RxCross2 size={24} />
                      </button>
                    </div>
                  )}

                </div>
              ))}

            </div>

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

            <div className="w-full" ref={inputRefCategory}>
              <label className="flex justify-start font-medium text-[#9F5216] pb-2">Sub-Category</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Add or Search Sub-Category"
                  value={subCategoryInput}
                  onFocus={handleSubCategoryInputFocus}
                  onChange={(e) => handleSubCategoryInputChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9F5216] focus:border-transparent transition duration-300 ease-in-out"
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

              {/* Sub-category suggestions */}
              {showSubCategorySuggestions && filteredSubCategories?.length > 0 && (
                <ul ref={suggestionsRefCategory} className="w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto z-[9999]">
                  {filteredSubCategories.map((subCategory, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors duration-150"
                      onClick={() => handleSubCategorySelect(subCategory)}
                    >
                      {subCategory}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected sub-categories */}
            <div className="selected-subCategories flex flex-wrap gap-3 mb-8">
              {selectedSubCategories?.map((subCategory, index) => (
                <div key={index} className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700">
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
                    src={image?.src || selectedDefaultImage}
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
                <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-8 xl:gap-4 mt-8'>
                  {defaultImages.map((defaultImage, index) => (
                    <div key={index} onClick={() => handleDefaultImageSelect(defaultImage)} className='cursor-pointer'>
                      <Image
                        src={defaultImage}
                        alt={`Default image ${index + 1}`}
                        height={2000}
                        width={2000}
                        className='w-full h-52 xl:h-96 rounded-md object-contain'
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

export default AddCategory;