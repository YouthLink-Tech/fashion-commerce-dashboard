"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import { Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross1, RxCross2 } from 'react-icons/rx';
import dynamic from 'next/dynamic';
import useCategories from '@/app/hooks/useCategories';
import { MdOutlineFileUpload } from 'react-icons/md';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import { FiSave } from 'react-icons/fi';
import useOffers from '@/app/hooks/useOffers';
import ProductSearchSelect from '@/app/components/marketing/ProductSearchSelect';
import { HiCheckCircle } from 'react-icons/hi2';
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const EditOffer = () => {

  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerDiscountType, setOfferDiscountType] = useState('Percentage');
  const [expiryDate, setExpiryDate] = useState(''); // Initial state set to an empty string
  const [offerDescription, setOfferDescription] = useState("");
  const [image, setImage] = useState(null);
  const [categoryList, isCategoryPending] = useCategories();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(false);
  const [dateError, setDateError] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productList, isProductPending] = useProductsInformation();
  const [productIdError, setProductIdError] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Products');
  const [offerList, isOfferPending] = useOffers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session, status } = useSession();
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleTabChangeForCategoryOrProduct = (key) => {
    setSelectedTab(key);
    // Reset the other tab's value when switching tabs
    if (key === "Products") {
      setSelectedCategories([]); // Clear selected categories when switching to Products
    } else if (key === "Categories") {
      setSelectedProductIds([]); // Clear selected products when switching to Categories
    }
  };

  const handleTabChange = (key) => {
    setOfferDiscountType(key);
    setValue("maxAmount", '');
  };

  // Format date to yyyy-mm-dd for date input field
  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {

    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchOfferData = async () => {
      try {
        const response = await axiosSecure.get(`/getSingleOffer/${id}`);
        const offer = response.data;

        // Ensure the expiry date is set to midnight to avoid timezone issues
        const fetchedExpiryDate = formatDateForInput(offer.expiryDate);

        // Set form fields with fetched offer data
        setValue('offerTitle', offer?.offerTitle);
        setValue('badgeTitle', offer?.badgeTitle);
        setValue('offerDiscountValue', offer?.offerDiscountValue);
        setExpiryDate(fetchedExpiryDate); // Ensure no time zone shift
        setValue('maxAmount', offer?.maxAmount || 0);
        setValue('minAmount', offer?.minAmount || 0);
        setOfferDiscountType(offer?.offerDiscountType);

        setOfferDescription(offer?.offerDescription || "");
        setImage(offer?.imageUrl || null);

        setSelectedCategories(offer?.selectedCategories || []);
        setSelectedProductIds(offer?.selectedProductIds || []);

        // Determine which tab to show based on the fetched data
        if (offer?.selectedCategories?.length > 0) {
          setSelectedTab('Categories');
        } else if (offer?.selectedProductIds?.length > 0) {
          setSelectedTab('Products');
        } else {
          setSelectedTab('Products'); // Default tab if both are empty
        }
        setIsLoading(false);
      } catch (err) {
        // console.error(err); // Log error to the console for debugging
        // toast.error("Failed to fetch offer code details!");
        router.push('/marketing');
      }
    };

    fetchOfferData();
  }, [id, axiosSecure, setValue, categoryList, session?.user?.accessToken, status, router]);

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

  const processFile = async (file) => {
    if (!VALID_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload JPG, PNG, WEBP, or JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be smaller than 10MB.');
      return;
    }

    if (file) {
      // Immediately upload the selected image to GCS
      const uploadedImageUrl = await uploadSingleFileToGCS(file);
      if (uploadedImageUrl) {
        setImage(uploadedImageUrl);
        setImageError("");
      }
    }
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
    document.getElementById('imageUpload').value = ''; // Clear the file input
  };

  // Handle category selection
  const handleCategorySelectionChange = async (categoryLabel) => {
    setSelectedCategories((prevCategories) => {
      let updatedSelectedCategories;

      if (prevCategories?.includes(categoryLabel)) {
        updatedSelectedCategories = prevCategories?.filter((category) => category !== categoryLabel);
      } else {
        updatedSelectedCategories = [...prevCategories, categoryLabel];
      }

      // Get the currently edited offer's ID
      const currentOfferId = id;

      // Get all products in other offers (excluding the current offer)
      const productsInOtherOffers = offerList
        ?.filter((offer) => offer?._id !== currentOfferId) // Ignore the current offer
        ?.flatMap((offer) => offer?.selectedProductIds);

      // Check if any of the new categories are in another offer (excluding the current offer)
      const categoryConflict = updatedSelectedCategories?.some((category) =>
        offerList?.some((offer) =>
          offer._id !== currentOfferId && offer?.selectedCategories?.includes(category)
        )
      );

      // Check if products under the selected category are already in another offer
      const hasProductConflict = updatedSelectedCategories?.some((category) => {
        const categoryProducts = productList
          ?.filter((product) => product?.category === category)
          ?.map((product) => product?.productId);

        return categoryProducts?.some((prodId) => productsInOtherOffers?.includes(prodId));
      });

      // Step 4: Handle conflicts (either category conflict or product conflict)
      if (categoryConflict) {
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
          >
            <div className="ml-6 p-1.5 rounded-full bg-red-500">
              <RxCross1 className="h-4 w-4 text-white rounded-full" />
            </div>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-base font-bold text-gray-900">
                    {`${categoryLabel} are already in another offer.`}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Please choose a different category or remove it from the other offer.
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
        return prevCategories; // Don't update the selected categories if there's a category conflict
      };

      if (hasProductConflict) {
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
          >
            <div className="ml-6 p-1.5 rounded-full bg-red-500">
              <RxCross1 className="h-4 w-4 text-white rounded-full" />
            </div>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-base font-bold text-gray-900">
                    {`Products in ${categoryLabel} are already in another offer`}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a different category or remove its products from the other offer.
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
        return prevCategories; // Don't update the selected categories if there's a product conflict
      };

      return updatedSelectedCategories; // Update state correctly
    });
  };

  // Filter categories based on search input and remove already selected categories
  const filteredCategories = categoryList?.filter((category) =>
    category?.label?.toLowerCase()?.includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label)); // Sorting A → Z

  const handleProductSelectionChange = async (selectedIds) => {
    if (selectedIds.length === 0) {
      setProductIdError(true);
      setSelectedProductIds([]);
      return false;
    }

    setProductIdError(false);

    // Get categories of the selected products
    const selectedProductsCategories = selectedIds.map(
      (prodId) => productList.find((p) => p.productId === prodId)?.category
    );

    // Ignore the current offer when checking for conflicts
    const otherOffers = offerList.filter(offer => offer._id !== id);

    // Check if any selected product is already in another offer
    const hasConflict = selectedIds.some((prodId) =>
      otherOffers.some((offer) => offer.selectedProductIds.includes(prodId))
    );

    // Check if any selected product's category is already in another offer
    const categoryConflict = selectedProductsCategories.some((category) =>
      otherOffers.some((offer) => offer.selectedCategories.includes(category))
    );

    if (hasConflict) {
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
        >
          <div className="ml-6 p-1.5 rounded-full bg-red-500">
            <RxCross1 className="h-4 w-4 text-white rounded-full" />
          </div>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-base font-bold text-gray-900">
                  Your selected product is already part of another offer.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Please choose a different product or remove it from the other offer.
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
      return false;
    }

    if (categoryConflict) {
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
        >
          <div className="ml-6 p-1.5 rounded-full bg-red-500">
            <RxCross1 className="h-4 w-4 text-white rounded-full" />
          </div>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-base font-bold text-gray-900">
                  Your selected product is already part of another category.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Please choose a different product or remove that category from the other offer.
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
      return false;
    }

    setSelectedProductIds([...selectedIds]);
    return true;
  };

  const onSubmit = async (data) => {
    const { offerTitle, offerDiscountValue, maxAmount, minAmount, badgeTitle } = data;

    let hasError = false;

    if (!expiryDate) {
      setDateError(true);
      hasError = true;
    } else {
      setDateError(false);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedExpiryDate = new Date(expiryDate);

      if (selectedExpiryDate < today) {
        toast.error("Expiry date cannot be in the past.");
        hasError = true;
      }
    }

    if (selectedTab === "Products" && selectedProductIds.length === 0) {
      setProductIdError(true);
      return;
    }

    if (selectedTab === "Categories" && selectedCategories.length === 0) {
      setCategoryError(true);
      return;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedDiscount = {
        offerTitle,
        badgeTitle,
        offerDiscountValue,
        offerDiscountType,
        expiryDate,
        maxAmount: maxAmount || 0,
        minAmount: minAmount || 0,
        offerDescription,
        selectedCategories,
        imageUrl: image === null ? "" : image,
        selectedProductIds
      };

      const res = await axiosSecure.put(`/updateOffer/${id}`, updatedDiscount);
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
                    Offer Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    The offer has been successfully updated!
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
        router.push('/marketing');
      } else {
        toast.error('No changes detected.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error editing offer:', error);
      toast.error('Failed to update offer. Please try again!');
      setIsSubmitting(false);
    }
  };

  if (isLoading || isCategoryPending || isProductPending || isOfferPending || status === "loading") {
    return <Loading />;
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-screen-2xl px-6 2xl:px-0 mx-auto'>

        <div className='max-w-screen-xl mx-auto pt-3 sticky top-0 z-10 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Edit Offer Configuration</h3>
            <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/marketing"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
          </div>
        </div>

        {/* Your form code */}
        <form onSubmit={handleSubmit(onSubmit)} className='max-w-screen-xl mx-auto pt-1 pb-6 flex flex-col gap-6'>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6'>

            <div className='grid grid-cols-1 lg:col-span-5 gap-8 mt-3 py-3 h-fit'>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                <div>
                  <label htmlFor='offerTitle' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Offer Title <span className="text-red-600 pl-1">*</span></label>
                  <input id='offerTitle' {...register("offerTitle", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="text" />
                  {errors.offerTitle?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Offer Title is required</p>
                  )}
                </div>

                <div>
                  <label htmlFor='badgeTitle' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Badge Title
                    <span className="text-red-600 pl-1">*</span>
                  </label>
                  <input id='badgeTitle' placeholder='Enter Badge Title'  {...register("badgeTitle", { required: true, maxLength: 12 })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" maxLength="12" type="text" />
                  {errors.badgeTitle?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Badge Title is required</p>
                  )}
                </div>

                <div className="flex w-full flex-col">

                  <Tabs
                    aria-label="Select Discount Type"
                    selectedKey={offerDiscountType} // Default select based on fetched data
                    onSelectionChange={handleTabChange}
                  >
                    <Tab key="Percentage" title="Percentage">
                      <span className='font-semibold text-neutral-500 text-sm'>
                        Percentage (%)
                      </span>
                      <span className="text-red-600 pl-1">*</span>
                    </Tab>
                    <Tab key="Amount" title="Amount">
                      <span className='font-semibold text-neutral-500 text-sm'>Amount (Taka)</span>
                      <span className="text-red-600 pl-1">*</span>
                    </Tab>
                  </Tabs>

                  <input
                    type="number"
                    {...register('offerDiscountValue', { required: true })}
                    className='custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold'
                    placeholder={`Enter ${offerDiscountType} Discount`} // Correct placeholder
                  />
                  {errors.offerDiscountValue?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Discount Value is required</p>
                  )}

                </div>

              </div>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                <div>
                  <label htmlFor='minAmount' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Minimum Order Amount <span className="text-red-600 pl-1">*</span></label>
                  <input id='minAmount' {...register("minAmount", { required: true })} placeholder='Enter Minimum Order Amount' className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="number" />
                  {errors.minAmount?.type === "required" && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Min Amount is required</p>
                  )}
                </div>

                {offerDiscountType === "Percentage" &&
                  <div>
                    <label htmlFor='maxAmount' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Maximum Capped Amount <span className="text-red-600 pl-1">*</span></label>
                    <input id='maxAmount' {...register("maxAmount", { required: true })} placeholder='Enter Maximum Capped Amount' className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" type="number" />
                    {errors.maxAmount?.type === "required" && (
                      <p className="text-left pt-2 text-red-500 font-semibold text-xs">Max Amount is required</p>
                    )}
                  </div>
                }

                <div className="space-y-2">

                  <label htmlFor='expiryDate' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">
                    Expiry Date
                    <span className="text-red-600 pl-1">*</span>
                  </label>

                  <input
                    type="date"
                    id="expiryDate"
                    {...register("expiryDate", { required: true })}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)} // Update state with the input value
                    className="w-full p-3 border rounded-md border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000"
                  />
                  {dateError && (
                    <p className="text-left pt-2 text-red-500 font-semibold text-xs">Expiry Date is required</p>
                  )}
                </div>

              </div>

            </div>

            <div className='grid grid-cols-1 lg:col-span-7 gap-8 mt-3 py-3'>

              <div className='flex flex-col bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <Tabs
                  aria-label="Product and Category Selection"
                  selectedKey={selectedTab}
                  onSelectionChange={handleTabChangeForCategoryOrProduct}
                >
                  <Tab key="Products" title="Products">
                    <div>
                      <label htmlFor='Product Selection' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Product Selection
                        <span className="text-red-600 pl-1">*</span>
                      </label>
                      {productList && (
                        <ProductSearchSelect
                          productList={productList}
                          onSelectionChange={handleProductSelectionChange}
                          selectedProductIds={selectedProductIds}
                          setSelectedProductIds={setSelectedProductIds}
                        />
                      )}
                      {productIdError && <p className="text-left pt-2 text-red-500 font-semibold text-xs">Please select at least one product ID</p>}
                    </div>
                  </Tab>
                  <Tab key="Categories" title="Categories">
                    <div>
                      <label htmlFor='Category' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Category Selection
                        <span className="text-red-600 pl-1">*</span>
                      </label>
                      {categoryList && (
                        <div>
                          <div className="w-full mx-auto" ref={dropdownRef}>

                            {/* Search Box */}
                            <input
                              type="text"
                              value={isDropdownOpen ? searchTerm : selectedCategories.join(", ")} // Show selected IDs when closed
                              onChange={(e) => setSearchTerm(e?.target?.value)}
                              onClick={() => setIsDropdownOpen(true)} // Toggle dropdown on input click
                              placeholder="Search & Select by Categories"
                              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                            />

                            {/* Dropdown list for search results */}
                            {isDropdownOpen && (
                              <div className="border flex flex-col gap-1.5 p-2 max-h-64 overflow-y-auto rounded-lg">
                                {filteredCategories?.length > 0 ? (
                                  filteredCategories?.map((category) => (
                                    <div
                                      key={category?._id}
                                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedCategories?.includes(category?.label) ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'}`}
                                      onClick={() => handleCategorySelectionChange(category?.label)}
                                    >
                                      <div className='flex items-center gap-1'>
                                        <Image
                                          width={4000}
                                          height={4000}
                                          src={category?.imageUrl}
                                          alt={category?.label}
                                          className="h-12 w-12 object-cover rounded"
                                        />
                                        <span className="ml-2 font-medium">{category?.label}</span>
                                      </div>
                                      <HiCheckCircle
                                        className={`pointer-events-none size-7 text-[#60d251] transition-opacity duration-300 ease-in-out ${selectedCategories?.includes(category?.label) ? "opacity-100" : "opacity-0"}`}
                                      />
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-500">No categories found</p>
                                )}
                              </div>
                            )}

                            {/* Selected categories display */}
                            {/* {selectedCategories.length > 0 && (
                              <div className="mt-2 rounded-lg border p-2">
                                <h4 className="mb-2 text-sm font-semibold">Selected Categories:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCategories?.map((label, index) => (
                                    <div key={index} className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700">
                                      <span>{label}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeCategory(label)}
                                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                                      >
                                        <RxCross2 size={19} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )} */}
                          </div>
                        </div>
                      )}
                      {categoryError && <p className="text-left pt-2 text-red-500 font-semibold text-xs">Select at least one category</p>}
                    </div>
                  </Tab>
                </Tabs>

              </div>

              <div className='flex flex-col gap-6 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <div className='flex w-full flex-col gap-2'>
                  <label htmlFor='offerDescription' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Offer Description</label>
                  <Controller
                    control={control}
                    name="offerDescription"
                    render={({ field }) => (
                      <Editor
                        {...field}
                        value={offerDescription}
                        onChange={setOfferDescription}
                      />
                    )}
                  />
                </div>

                <div className='flex flex-col gap-4'>

                  <div>
                    <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                      Offer Thumbnail
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
                      </div>
                    </label>
                    {imageError && (
                      <p className="text-left text-red-500 font-semibold text-xs pt-2">{imageError}</p>
                    )}
                  </div>

                  {image && (
                    <div className='relative'>
                      <Image
                        src={typeof image === 'string' ? image : image.src}
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

              </div>

            </div>

          </div>

          <div className='flex justify-end items-center'>

            <button
              type='submit'
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}
            >
              {isSubmitting ? 'Saving...' : 'Save'} <FiSave size={20} />
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOffer;