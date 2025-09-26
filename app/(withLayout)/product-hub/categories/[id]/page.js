"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import useCategories from '@/app/hooks/useCategories';
import { Button } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const axiosSecure = useAxiosSecure();
  const [image, setImage] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRefCategory = useRef(null);
  const suggestionsRefCategory = useRef(null);
  const [categoryList, isCategoryPending] = useCategories();
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
  const [sizeImagesForSuggestion, setSizeImagesForSuggestion] = useState({});
  const [categoryKey, setCategoryKey] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const { data: session, status } = useSession();
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const [sizeGuideImageError, setSizeGuideImageError] = useState("");
  const [sizeRangeError, setSizeRangeError] = useState("");
  const [subCategoryError, setSubCategoryError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { category: '', sizes: [{ size: '' }], subCategories: [{ subCategory: '' }] }
  });

  // Fetch all unique sizes from categoryList
  useEffect(() => {
    const allSizes = [];
    const images = {};
    const imagesForSuggestion = {};
    const allSubCategories = [];

    categoryList?.forEach(category => {
      // Collect unique sizes
      category.sizes.forEach(size => {
        if (!allSizes.includes(size)) {
          allSizes.push(size);
        }
      });

      // Collect images
      images[category.label] = category.sizeImages || {};
      Object.assign(imagesForSuggestion, category.sizeImages);
      // Collect subcategories
      category.subCategories.forEach(sub => {
        if (!allSubCategories.includes(sub.label)) {
          allSubCategories.push(sub.label);
        }
      });
    });

    setFetchedSizes(allSizes);
    setSizeImages(images);
    setSizeImagesForSuggestion(imagesForSuggestion);
    setFetchedSubCategories(allSubCategories); // Set the state with fetched subcategories
  }, [categoryList]);

  useEffect(() => {
    if (!params.id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchCategory = async () => {
      try {
        const res = await axiosSecure.get(`/allCategories/${params.id}`);
        const category = res.data;
        setValue('category', category?.label);
        setCategoryKey(category?.key);
        setSelectedSizes(category?.sizes);
        setSelectedSubCategories(category?.subCategories.map(sub => sub.label));
        setImage(category?.imageUrl || null);
        setCategoryDetails(category);
      } catch (error) {
        // console.error('Error fetching category:', error);
        // toast.error('Error fetching category data.');
        router.push('/product-hub/categories');
      }
    };
    fetchCategory();
  }, [params.id, axiosSecure, setValue, session?.user?.accessToken, status, router]);

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
    setSubCategoryError("");
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
    setSizeRangeError("");
  };

  // Select from suggestion list
  const handleSizeSelect = (size) => {
    addSize(size); // Use the common function for validation and addition
    setShowSuggestions(false); // Hide suggestions after selecting
    setSizeRangeError("");
  };

  // Remove size from the list
  const handleSizeRemove = (indexToRemove) => {
    setSelectedSizes(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const uploadSingleFileToGCS = async (image) => {
    try {
      const formData = new FormData();
      formData.append('attachment', image);

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!VALID_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload JPG, PNG, WEBP, or JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be smaller than 10MB.');
      return;
    }

    setImage({
      src: URL.createObjectURL(file),
      file
    });
    setImageError('');
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
    setImageError("You must select or upload an image.")
  };

  const handleImageChangeForSizeRange = (size, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    setSizeImages(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [size]: {
          src: URL.createObjectURL(file), // for preview
          file, // for upload
        },
      },
    }));
  };

  const handleImageRemoveForSizeRange = (size) => {
    setSizeImages(prev => {
      const updatedImages = { ...prev };
      if (updatedImages[categoryKey]) {
        delete updatedImages[categoryKey][size]; // remove the image for the specific size
        // Optionally clean up if there are no images left for the category
        if (Object.keys(updatedImages[categoryKey]).length === 0) {
          delete updatedImages[categoryKey]; // Remove the category key if empty
        }
      }
      return updatedImages;
    });
  };

  const onSubmit = async (data) => {
    try {

      // Initialize imageUrl with the existing one
      let imageUrl = categoryDetails?.imageUrl || '';

      // If a new image is uploaded, upload it to Imgbb
      if (image && image.file) {
        imageUrl = await uploadSingleFileToGCS(image.file);
        if (!imageUrl) {
          toast.error('Image upload failed, cannot proceed.');
          hasError = true;
        }
      } else if (image === null) {
        // If the image is removed, explicitly set imageUrl to an empty string
        imageUrl = '';
        setImageError('You must upload an image.');
        return;
      }

      const updatedSizeImages = {};

      // Validate and handle size guide images
      for (const size of selectedSizes) {
        const imageData = sizeImages[categoryKey]?.[size];

        if (!imageData) {
          // If no size guide image exists for the selected size, show an error
          setSizeGuideImageError(`Size guide image is required for size ${size}.`);
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
              return;
            }

            updatedSizeImages[size] = uploadedImageUrl;  // Save the new image URL
          } catch (error) {
            console.error(`Error uploading image for size ${size}:`, error);
            toast.error(`Image upload failed for size ${size}, cannot proceed.`);
            return;
          }
        } else {
          console.warn(`No file to upload for size ${size}`);
        }
      }

      // Validate sizes
      if (selectedSizes.length === 0) {
        setSizeRangeError('You must select at least one size.');
        return;
      }

      // Validate subCategories (if required)
      if (selectedSubCategories.length === 0) {
        setSubCategoryError('You must select at least one sub-category.');
        return;
      }

      const formattedSubCategories = selectedSubCategories.map((subCategory) => ({
        key: subCategory, // Assuming subCategory is a string
        label: subCategory,
      }));

      const updatedCategory = {
        key: data?.category,
        label: data?.category,
        sizes: selectedSizes,
        sizeImages: updatedSizeImages, // Updated size images
        subCategories: formattedSubCategories,
        imageUrl
      };

      const res = await axiosSecure.put(`/editCategory/${params.id}`, updatedCategory);
      if (res.data.modifiedCount > 0) {
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
                    Category Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Category has been updated successfully!
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
        router.push('/product-hub/categories');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing category:', error);
      toast.error('There was an error editing the category. Please try again.');
    }
  };

  if (isCategoryPending || status === "loading") {
    return <Loading />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='bg-gray-50'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Edit Category Details</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/categories"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

          {/* Category Field */}
          <div className="w-full">
            <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Category <span className="text-red-600 pl-1">*</span></label>
            <input
              type="text"
              placeholder="Add Category"
              {...register('category', { required: 'Category is required' })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              disabled
            />
            {errors.category && (
              <p className="text-left pt-1 text-red-500 font-semibold text-xs">{errors.category.message}</p>
            )}
          </div>

          {/* Size input field with improved styling */}
          <div className="w-full" ref={inputRef}>
            <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Size Range <span className="text-red-600 pl-1">*</span></label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add or Search Size Range (e.g., XXS-6XL)"
                value={sizeInput}
                onFocus={handleInputFocus}
                onChange={(e) => handleSizeInputChange(e.target.value)}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
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

            {sizeRangeError && (
              <p className="text-left pt-1 text-red-500 font-semibold text-xs">{sizeRangeError}</p>
            )}

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
                    {sizeImagesForSuggestion[size] && (
                      <Image
                        src={sizeImagesForSuggestion[size]}
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

          <div>
            {/* Display selected sizes with a more polished look */}
            <div className="selected-sizes flex flex-wrap gap-3">
              {selectedSizes?.map((size, index) => (
                <div key={index} className="flex flex-col items-start gap-2 bg-gray-100 border border-gray-300 rounded-md p-3">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-sm font-bold text-gray-700">{size}</span>
                    <button
                      type="button"
                      onClick={() => handleSizeRemove(index)}
                      className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                    >
                      <RxCross2 size={19} />
                    </button>
                  </div>

                  {/* Image upload input - Only show this if there is no image for the selected size */}
                  {!sizeImages[categoryKey]?.[size] || (!sizeImages[categoryKey][size]?.src && typeof sizeImages[categoryKey][size] !== 'string') ? (
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
                        src={typeof sizeImages[categoryKey][size] === 'string' ? sizeImages[categoryKey][size] : sizeImages[categoryKey][size].src}
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

            {sizeGuideImageError && (
              <p className="text-left pt-2 text-red-500 font-semibold text-xs">{sizeGuideImageError}</p>
            )}
          </div>

        </div>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

          <div className="w-full" ref={inputRefCategory}>
            <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Sub-Category <span className="text-red-600 pl-1">*</span></label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add or Search Sub-Category"
                value={subCategoryInput}
                onFocus={handleSubCategoryInputFocus}
                onChange={(e) => handleSubCategoryInputChange(e.target.value)}
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
            <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
              Category Thumbnail <span className="text-red-600 pl-1">*</span>
            </label>
            <input
              id='imageUpload'
              type='file'
              className='hidden'
              onChange={handleImageChange}
            />
            <label
              htmlFor='imageUpload'
              className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed duration-500 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
                } hover:border-blue-300 hover:bg-blue-50 p-6 cursor-pointer`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                <p className="text-[11px] text-gray-500">Required size: 300 (W) × 400 (H)</p>
              </div>
            </label>

            {imageError && (
              <p className="text-left pt-3 text-red-500 font-semibold text-xs">{imageError}</p>
            )}

            {image && (
              <div className='relative'>
                <Image
                  src={typeof image === 'string' ? image : image.src}
                  alt='Uploaded image'
                  height={2000}
                  width={2000}
                  className='w-1/2 mx-auto h-[350px] mt-8 rounded-lg object-contain'
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

        </div>

        {/* Submit Button */}
        <div className='flex justify-end pt-4 pb-8'>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'} <FiSave size={20} />
          </button>
        </div>

      </div>

    </form>
  );
}