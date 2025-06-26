"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import toast from 'react-hot-toast';
import ReactSelect from "react-select";
import ColorOption from '@/app/components/product/color/ColorOption';
import { CheckboxGroup, Select, SelectItem, Tabs, Tab, RadioGroup, Radio } from "@nextui-org/react";
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { CustomCheckbox } from '@/app/components/product/checkbox/CustomCheckbox';
import { CustomCheckbox2 } from '@/app/components/product/checkbox/CustomCheckbox2';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import Image from 'next/image';
import { RxCheck, RxCross1, RxCross2 } from 'react-icons/rx';
import { MdOutlineFileUpload } from 'react-icons/md';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import useCategories from '@/app/hooks/useCategories';
import Loading from '@/app/components/shared/Loading/Loading';
import useSizeRanges from '@/app/hooks/useSizeRanges';
import { generateSizes } from '@/app/utils/generate-sizes/GenerateSizes';
import useSubCategories from '@/app/hooks/useSubCategories';
import useTags from '@/app/hooks/useTags';
import useVendors from '@/app/hooks/useVendors';
import useColors from '@/app/hooks/useColors';
import Link from 'next/link';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import { FiSave } from "react-icons/fi";
import useSeasons from '@/app/hooks/useSeasons';
import { HiCheckCircle } from 'react-icons/hi2';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import DOMPurify from "dompurify";
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import ExitConfirmationModal from '@/app/components/product/modal/ExitConfirmationModal';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const FirstStepOfAddProduct = () => {

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm();
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [tagList, isTagPending] = useTags();
  const [vendorList, isVendorPending] = useVendors();
  const [colorList, isColorPending] = useColors();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [groupSelected, setGroupSelected] = React.useState();
  const [groupSelected2, setGroupSelected2] = React.useState();
  const [navigate, setNavigate] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [sizeError2, setSizeError2] = useState(false);
  const [sizeError3, setSizeError3] = useState(false);
  const [sizeError4, setSizeError4] = useState(false);
  const [menuPortalTarget, setMenuPortalTarget] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedNewArrival, setSelectedNewArrival] = useState("");
  const [isTrending, setIsTrending] = useState("");
  const [selectedAvailableColors, setSelectedAvailableColors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [unselectedGroupSelected2, setUnselectedGroupSelected2] = React.useState([]);
  const [materialCare, setMaterialCare] = useState("");
  const [sizeFit, setSizeFit] = useState("");
  const [discountType, setDiscountType] = useState('Percentage');
  const [dragging, setDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [categoryList, isCategoryPending] = useCategories();
  const [sizeRangeList, isSizeRangePending] = useSizeRanges();
  const [subCategoryList, isSubCategoryPending] = useSubCategories();
  const [productList, isProductPending] = useProductsInformation();
  const [seasonList, isSeasonPending] = useSeasons();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermForCompleteOutfit, setSearchTermForCompleteOutfit] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpenForCompleteOutfit, setIsDropdownOpenForCompleteOutfit] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownRefForCompleteOutfit = useRef(null);
  const [seasonError, setSeasonError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Function to handle "Go Back" button click
  const handleGoBackClick = (e) => {
    e.preventDefault();  // Prevent immediate navigation
    setShowModal(true);  // Show confirmation modal
  };

  // Function to handle "Yes" button (confirm navigation)
  const handleConfirmExit = () => {
    setShowModal(false);
    router.push("/product-hub/products");  // Navigate to the "Go Back" page
  };

  // Function to close the modal without navigating
  const handleCloseModal = () => {
    setShowModal(false);
    // Scroll to bottom of the page
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // Filter categories based on search input and remove already selected categories
  const filteredSeasons = seasonList
    ?.filter((season) =>
      season.seasonName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.seasonName.localeCompare(b.seasonName)); // Sorting A → Z

  // Filter products based on search input and remove already selected products
  const filteredProducts = productList?.filter((product) =>
  (product.productId.toLowerCase().includes(searchTermForCompleteOutfit.toLowerCase()) ||
    product.productTitle.toLowerCase().includes(searchTermForCompleteOutfit.toLowerCase())))
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)); // Sorting latest → oldest;

  // Handle adding/removing category selection
  const toggleSeasonSelection = (seasonName) => {
    let updatedSelectedSeasons;

    if (selectedSeasons.includes(seasonName)) {
      // Remove season from selection
      updatedSelectedSeasons = selectedSeasons.filter((season) => season !== seasonName);
    } else {
      // Restrict selection to a maximum of 2 seasons
      if (selectedSeasons.length >= 2) {
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
                    You can select up to 2 seasons only.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You have reached the maximum limit of 2 seasons. Please remove one to add another.
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
        return;
      }

      updatedSelectedSeasons = [...selectedSeasons, seasonName];
      setSeasonError(""); // Clear error if valid selection
    }

    setSelectedSeasons(updatedSelectedSeasons);
    handleSeasonSelectionChange(updatedSelectedSeasons); // Pass selected seasons to parent component
  };

  const handleSeasonSelectionChange = async (selectedSea) => {
    setSelectedSeasons(selectedSea);
    if (selectedSea?.length === 0) {
      setSeasonError(true);
      return;
    }
    setSeasonError(false);
  };

  // Handle adding/removing category selection
  const toggleProductSelection = (productId, productTitle, id, imageUrl) => {
    let updatedSelectedProducts = [...selectedProductIds];

    // Check if the product is already selected
    const isAlreadySelected = updatedSelectedProducts.some((p) => p.productId === productId);

    if (isAlreadySelected) {
      // Remove the product if it's already selected
      updatedSelectedProducts = updatedSelectedProducts.filter((p) => p.productId !== productId);
    } else {
      // Allow adding only if there are less than 4 selected products
      if (updatedSelectedProducts.length < 4) {
        updatedSelectedProducts.push({ productId, productTitle, id, imageUrl });
      } else {
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
                    You can select up to 4 products only.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You have reached the maximum limit of 4 products. Please remove one to add another.
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
      }
    }

    setSelectedProductIds(updatedSelectedProducts);
    handleProductSelectionChange(updatedSelectedProducts);
  };

  const handleProductSelectionChange = (selectedProducts) => {
    setSelectedProductIds(selectedProducts); // Update the state with selected products
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefForCompleteOutfit.current && !dropdownRefForCompleteOutfit.current.contains(event.target)) {
        setIsDropdownOpenForCompleteOutfit(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRefForCompleteOutfit]);

  const handleCategoryChange = (value) => {
    localStorage.setItem('category', value); // Save the selected category to local storage
    setValue('category', value, { shouldValidate: true });
    setSelectedCategory(value);
    setGroupSelected([]);
    setGroupSelected2([]);
    setSelectedSubCategories([]);
    setUnselectedGroupSelected2([]);
    localStorage.removeItem("groupOfSizes");
    localStorage.removeItem("allSizes");
    localStorage.removeItem("subCategories");
  };

  const handleSubCategoryArray = (keys) => {
    const selectedArray = [...keys];
    if (selectedArray.length > 0) {
      setSizeError4(false);
    }
    else {
      setSizeError4(true);
    }
    setSelectedSubCategories(selectedArray);

    localStorage.setItem('subCategories', JSON.stringify(selectedSubCategories));
  };

  const handleGroupSelectedChange = (sizes) => {
    if (sizes.length > 1) {
      return; // Prevent selecting more than one size range at a time
    }

    if (sizes.length > 0) {
      setSizeError2(false);
    }

    localStorage.setItem('groupOfSizes', JSON.stringify(sizes));

    // Generate sizes based on the selected size range
    const newRelatedSizes = sizes.flatMap(size => generateSizes(size) || []);

    setGroupSelected(sizes);

    setUnselectedGroupSelected2([]); // Reset previously unselected sizes

    setGroupSelected2(newRelatedSizes); // Directly set new sizes

    localStorage.setItem('allSizes', JSON.stringify(newRelatedSizes));
  };

  const handleGroupSelected2Change = (sizes) => {
    const sizeOrder = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL"];

    const isNumeric = (size) => !isNaN(size);
    const sortSizes = (sizesArray) => {
      return sizesArray.sort((a, b) => {
        if (isNumeric(a) && isNumeric(b)) {
          return Number(a) - Number(b);
        } else if (!isNumeric(a) && !isNumeric(b)) {
          return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
        } else {
          return isNumeric(a) ? 1 : -1;
        }
      });
    };

    // Save to local storage
    localStorage.setItem("allSizes", JSON.stringify(sizes));

    setGroupSelected2((prevSizes) => {
      const updatedSizes = [...sizes]; // Create a new array with the latest sizes
      const sortedSizes = sortSizes(updatedSizes); // Ensure correct sorting
      localStorage.setItem("allSizes", JSON.stringify(sortedSizes));
      return sortedSizes;
    });

    if (sizes.length > 0) {
      setSizeError3(false);
    }

    setUnselectedGroupSelected2((prevUnselected) => {
      const sizesArray = Array.isArray(sizes) ? sizes : [];
      const newlyUnselected = groupSelected2.filter(size => !sizesArray.includes(size));
      return [...prevUnselected, ...newlyUnselected];
    });
  };

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await axiosPublic.post('/upload-single-file', formData, {
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

  const handleTabChange = (key) => {
    setDiscountType(key);
    localStorage.setItem('discountType', key);
  };

  useEffect(() => {
    // Function to clear the relevant parts of local storage
    const clearVariantStorage = () => {
      const storedVariants = JSON.parse(localStorage.getItem('productVariants') || '[]');
      const storedSizes = JSON.parse(localStorage.getItem('allSizes') || '[]');
      const storedColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
      const updatedVariants = storedVariants.filter(variant =>
        storedSizes.includes(variant.size) && storedColors.some(color => color.value === variant.color.value)
      );
      localStorage.setItem('productVariants', JSON.stringify(updatedVariants));
    };

    // Call the clearVariantStorage function whenever allSizes or availableColors change
    clearVariantStorage();
  }, []);

  useEffect(() => {
    try {
      const safelyParseJSON = (json) => {
        try {
          return JSON.parse(json);
        } catch (e) {
          return null;
        }
      };

      const storedProductTitle = localStorage.getItem('productTitle');
      if (storedProductTitle) setValue('productTitle', storedProductTitle);

      const storedProductBatchCode = localStorage.getItem('batchCode');
      if (storedProductBatchCode) setValue('batchCode', storedProductBatchCode);

      const storedProductWeight = localStorage.getItem('weight');
      if (storedProductWeight) setValue('weight', storedProductWeight);

      const storedRegularPrice = localStorage.getItem('regularPrice');
      if (storedRegularPrice) setValue('regularPrice', storedRegularPrice);

      const storedUploadedImageUrl = localStorage.getItem('uploadedImageUrl');
      if (storedUploadedImageUrl) {
        setImage(storedUploadedImageUrl);
      }

      const storedDiscountType = localStorage.getItem('discountType');
      if (storedDiscountType) {
        setDiscountType(storedDiscountType);
      }

      const storedDiscountValue = localStorage.getItem('discountValue');
      if (storedDiscountValue) {
        setValue('discountValue', storedDiscountValue || 0);
      }

      const storedProductDetails = localStorage.getItem('productDetails');
      if (storedProductDetails) {
        setValue('productDetails', storedProductDetails); // Set form default value
      }

      const storedMaterialCare = localStorage.getItem('materialCare');
      if (storedMaterialCare) {
        setMaterialCare(storedMaterialCare);
        setValue('materialCare', storedMaterialCare);
      }

      const storedSizeFit = localStorage.getItem('sizeFit');
      if (storedSizeFit) {
        setSizeFit(storedSizeFit);
        setValue('sizeFit', storedSizeFit);
      }

      const storedCategory = localStorage.getItem('category');
      if (storedCategory) {
        setSelectedCategory(storedCategory);
        setValue('category', storedCategory);
      }

      const storedSeason = JSON.parse(localStorage.getItem('season') || '[]');
      if (Array.isArray(storedSeason)) {
        setSelectedSeasons(storedSeason);
        setValue('season', storedSeason);
      }

      const storedProducts = JSON.parse(localStorage.getItem('restOfOutfit') || '[]');
      if (Array.isArray(storedProducts)) {
        setSelectedProductIds(storedProducts);
        setValue('restOfOutfit', storedProducts);
      }

      const storedSubCategories = JSON.parse(localStorage.getItem('subCategories') || '[]');
      if (Array.isArray(storedSubCategories)) {
        setSelectedSubCategories(storedSubCategories);
        setValue('subCategories', storedSubCategories);
      }

      const storedGroupOfSizes = localStorage.getItem('groupOfSizes');
      if (storedGroupOfSizes) {
        setGroupSelected(JSON.parse(storedGroupOfSizes) || []);
      }

      const storedAllSizes = localStorage.getItem('allSizes');
      if (storedAllSizes) {
        setGroupSelected2(JSON.parse(storedAllSizes) || []);
      }

      const storedAvailableColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
      if (Array.isArray(storedAvailableColors)) {
        setSelectedAvailableColors(storedAvailableColors);
        setValue('availableColors', storedAvailableColors);
      }

      const storedNewArrival = localStorage.getItem('newArrival');
      if (storedNewArrival) {
        setSelectedNewArrival(storedNewArrival);
        setValue('newArrival', storedNewArrival);
      }

      const storedIsTrending = localStorage.getItem('trending');
      if (storedIsTrending) {
        setIsTrending(storedIsTrending);
        setValue('trending', storedIsTrending);
      }

      const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
      if (Array.isArray(storedVendors)) {
        setSelectedVendors(storedVendors);
        setValue('vendors', storedVendors);
      }

      const storedTags = JSON.parse(localStorage.getItem('tags') || '[]');
      if (Array.isArray(storedTags)) {
        setSelectedTags(storedTags);
        setValue('tags', storedTags);
      }

      if (typeof document !== 'undefined') {
        setMenuPortalTarget(document.body);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, [setValue]);

  const generateProductID = (category) => {
    const prefix = "FC"; // Automatically generated "FC"
    const currentYear = new Date().getFullYear();
    const yearCode = String(currentYear).slice(-3); // Last 3 digits of the year (e.g., "024" for 2024)

    // Filter the productList to get products only in the specified category
    const productsInCategory = productList?.filter(product => product?.category === category);

    // Extract the numeric parts of existing product IDs
    const productNumbers = productsInCategory
      ?.map(product => {
        const match = product?.productId?.match(/(\d+)$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      ?.filter(number => number > 0);

    // Get the highest number found in the product IDs
    const highestNumber = productNumbers?.length ? Math.max(...productNumbers) : 0;

    // Calculate the next product number, skipping deleted product numbers
    const nextProductNumber = String(highestNumber + 1).padStart(3, '0'); // 3-digit number with leading zeros

    // Remove special characters from category and get the first 2 valid letters
    const categoryCode = category.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();

    const productID = `${prefix}${yearCode}${categoryCode}${nextProductNumber}`;
    return productID;
  };

  const getSizeImageForGroupSelected = (groupSelected, selectedCategory, categoryList = []) => {
    let selectedImageUrl = '';

    // Check if categoryList is an array
    if (!Array.isArray(categoryList)) {
      console.error("categoryList is not an array or is undefined:", categoryList);
      return selectedImageUrl; // Return an empty string or handle the case as needed
    }

    // Ensure groupSelected is an array or convert it to an array if it's a single string
    const sizesToCheck = Array.isArray(groupSelected) ? groupSelected : [groupSelected];

    // Find the category that matches the selectedCategory (based on key or label)
    const matchedCategory = categoryList.find(
      category => category.key === selectedCategory || category.label === selectedCategory
    );

    // If we found the matched category, search within its sizeImages
    if (matchedCategory) {
      for (const size of sizesToCheck) {
        if (matchedCategory.sizeImages && matchedCategory.sizeImages[size]) {
          selectedImageUrl = matchedCategory.sizeImages[size]; // Get the imageUrl for the selected size
          break; // Stop once we find the matching size
        }
      }
    }

    return selectedImageUrl; // Return the selected image URL if found
  };

  // Example usage:
  const selectedImageUrl = getSizeImageForGroupSelected(groupSelected, selectedCategory, categoryList || []);

  const onSubmit = async (data) => {
    try {

      if (!image) {
        setSizeError(true);
        return;
      }
      setSizeError(false);

      if (groupSelected.length === 0) {
        setSizeError2(true);
        return;
      }
      setSizeError2(false);

      if (groupSelected2.length === 0) {
        setSizeError3(true);
        return;
      }
      setSizeError3(false);

      if (selectedSubCategories.length === 0) {
        setSizeError4(true);
        return;
      }
      setSizeError4(false);

      if (selectedSeasons?.length === 0) {
        setSeasonError(true);
        return;
      }
      setSeasonError(false);

      const currentDate = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = currentDate.toLocaleDateString('en-US', options);
      const productId = generateProductID(selectedCategory);

      localStorage.setItem('formattedDate', formattedDate);
      localStorage.setItem('productTitle', data.productTitle);
      localStorage.setItem('weight', data.weight);
      localStorage.setItem('batchCode', data.batchCode);
      localStorage.setItem('regularPrice', parseFloat(data.regularPrice) || 0);
      localStorage.setItem('discountType', discountType);
      localStorage.setItem('discountValue', parseFloat(data.discountValue || 0));
      localStorage.setItem('sizeGuideImageUrl', selectedImageUrl);
      localStorage.setItem('uploadedImageUrl', image);
      localStorage.setItem('season', JSON.stringify(selectedSeasons));
      localStorage.setItem('restOfOutfit', JSON.stringify(selectedProductIds));
      localStorage.setItem('subCategories', JSON.stringify(selectedSubCategories));
      localStorage.setItem('availableColors', JSON.stringify(data.availableColors));
      localStorage.setItem('vendors', JSON.stringify(data.vendors));
      localStorage.setItem('tags', JSON.stringify(data.tags));
      localStorage.setItem('newArrival', data.newArrival);
      localStorage.setItem('trending', data.trending);
      localStorage.setItem('productId', productId);
      setNavigate(true);
    } catch (err) {
      toast.error("Failed to publish your work");
    }
  };

  // New function for "Save for Now" button
  const onSaveForNow = async (formData) => {

    if (!image) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    if (groupSelected.length === 0) {
      setSizeError2(true);
      return;
    }
    setSizeError2(false);

    if (groupSelected2.length === 0) {
      setSizeError3(true);
      return;
    }
    setSizeError3(false);

    if (selectedSubCategories.length === 0) {
      setSizeError4(true);
      return;
    }
    setSizeError4(false);

    if (selectedSeasons?.length === 0) {
      setSeasonError(true);
      return;
    }
    setSeasonError(false);

    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const publishDate = currentDate.toLocaleDateString('en-US', options);
    const productId = generateProductID(selectedCategory);
    const productData = {
      ...formData,
      thumbnailImageUrl: image,
      discountType,
      publishDate,
      groupOfSizes: groupSelected,
      allSizes: groupSelected2,
      productId,
      season: selectedSeasons,
      sizeGuideImageUrl: selectedImageUrl,
      status: "draft",
      restOfOutfit: selectedProductIds,
      materialCare,
      sizeFit
    };

    try {
      const response = await axiosSecure.post('/addProduct', productData);
      if (response?.data?.insertedId) {
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
                    Product Drafted!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    This Product is successfully drafted!
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
        localStorage.removeItem('productTitle');
        localStorage.removeItem('batchCode');
        localStorage.removeItem('weight');
        localStorage.removeItem('regularPrice');
        localStorage.removeItem('uploadedImageUrl');
        localStorage.removeItem('discountType');
        localStorage.removeItem('discountValue');
        localStorage.removeItem('productDetails');
        localStorage.removeItem('materialCare');
        localStorage.removeItem('sizeFit');
        localStorage.removeItem('category');
        localStorage.removeItem('productId');
        localStorage.removeItem('sizeGuideImageUrl');
        JSON.parse(localStorage.removeItem('season') || '[]');
        JSON.parse(localStorage.removeItem('subCategories') || '[]');
        JSON.parse(localStorage.removeItem('groupOfSizes') || '[]');
        JSON.parse(localStorage.removeItem('allSizes') || '[]');
        JSON.parse(localStorage.removeItem('availableColors') || '[]');
        localStorage.removeItem('newArrival');
        JSON.parse(localStorage.removeItem('vendors') || '[]');
        JSON.parse(localStorage.removeItem('tags') || '[]');
        JSON.parse(localStorage.removeItem('restOfOutfit') || '[]');
        router.push("/product-hub/products/existing-products");
      }
    } catch (err) {
      toast.error("Failed to save product information");
    }
  };

  useEffect(() => {
    if (navigate) {
      router.push("/product-hub/products/add-product-2");
      setNavigate(false); // Reset the state
    }
  }, [navigate, router]);

  if (isCategoryPending || isSizeRangePending || isSubCategoryPending || isTagPending || isVendorPending || isColorPending || isProductPending || isSeasonPending) {
    return <Loading />
  };

  return (
    <div className='bg-gray-50 min-h-screen relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat xl:left-[15%] 2xl:left-[30%] bg-[length:1600px_900px]'
      />

      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      />

      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-16 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[50%] bg-no-repeat'
      />

      <div className='max-w-screen-2xl mx-auto py-3 md:py-6 px-6 sticky top-0 z-10 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <h3 className='flex-1 font-semibold text-[13px] md:text-xl lg:text-3xl text-neutral-700'>PRODUCT CONFIGURATION</h3>

          <Link // Trigger the modal on click
            className="flex items-center gap-2 text-[10px] md:text-base justify-end"
            href="/products"
            onClick={handleGoBackClick}>
            <span className="border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2">
              <FaArrowLeft />
            </span>
            Go Back
          </Link>

        </div>
      </div>

      <form className='2xl:max-w-screen-2xl 2xl:mx-auto relative' onSubmit={handleSubmit(onSubmit)}>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6'>

          <div className='grid grid-cols-1 lg:col-span-7 gap-8 px-6 py-3 h-fit'>
            <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
              <label htmlFor='productTitle' className='flex justify-start font-medium text-[#9F5216]'>Product Title *</label>
              <input id='productTitle' {...register("productTitle", { required: true })} className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md" placeholder='Enter Product Title' type="text" />
              {errors.productTitle?.type === "required" && (
                <p className="text-red-600 text-left">Product Title is required</p>
              )}

              <label htmlFor='productDetails' className='flex justify-start font-medium text-[#9F5216]'>
                Details About This Product *
              </label>
              <Controller
                name="productDetails"
                defaultValue=""
                rules={{
                  required: "Product details are required.",
                  validate: (value) => {
                    const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                    return strippedText.length >= 10 || "Product details must be at least 10 characters.";
                  },
                }}
                control={control}
                render={({ field }) => <Editor
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    localStorage.setItem('productDetails', value); // Update local storage
                  }}
                />}
              />
              {errors.productDetails && (
                <p className="text-red-600 text-left pt-1">{errors.productDetails.message}</p>
              )}
            </div>

            <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

              <div className='flex flex-col rounded-md relative'>
                <label htmlFor="category" className='text-xs px-2'>Category</label>
                <select
                  id="category"
                  className={`bg-gray-100 p-2 rounded-md ${errors.category ? 'border-red-600' : ''}`}
                  value={selectedCategory}
                  {...register('category', { required: 'Category is required' })}
                  onChange={(e) => {
                    handleCategoryChange(e.target.value);
                  }}
                >
                  <option value="" disabled className='bg-white'>Select a category</option>
                  {categoryList?.map((category) => (
                    <option className='bg-white' key={category.key} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-left">{errors.category.message}</p>
                )}
              </div>

              {selectedCategory && sizeRangeList[selectedCategory] && (
                <div className="flex flex-col gap-1 w-full">
                  <CheckboxGroup
                    className="gap-1"
                    label="Select size"
                    orientation="horizontal"
                    value={groupSelected}
                    onChange={handleGroupSelectedChange}
                  >
                    {sizeRangeList[selectedCategory]?.map((size) => (
                      <CustomCheckbox
                        key={size}
                        value={size}
                        isDisabled={groupSelected?.length > 0 && !groupSelected?.includes(size)} // Disable other sizes if one is selected
                      >
                        {size}
                      </CustomCheckbox>
                    ))}
                  </CheckboxGroup>
                  {sizeError2 && (
                    <p className="text-red-600 text-left">Please select at least one size.</p>
                  )}
                </div>
              )}

              {groupSelected?.length > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  <CheckboxGroup
                    className="gap-1"
                    label="Unselect sizes"
                    orientation="horizontal"
                    value={groupSelected2}
                    onChange={handleGroupSelected2Change}
                  >
                    {generateSizes(groupSelected[0] || '')?.map(size => (
                      <CustomCheckbox2 key={size} value={size}>{size}</CustomCheckbox2>
                    ))}
                  </CheckboxGroup>
                  <p className="mt-4 ml-1 text-default-500">
                    Selected: {groupSelected2?.join(", ")}
                  </p>
                  {sizeError3 && (
                    <p className="text-red-600 text-left">Please select at least one size.</p>
                  )}
                </div>
              )}

              {groupSelected2?.length > 0 && (
                <div className="flex w-full flex-col gap-2">
                  <Controller
                    name="subCategories"
                    control={control}
                    defaultValue={selectedSubCategories}
                    rules={{ required: 'Sub-Category is required' }}
                    render={({ field }) => (
                      <div>
                        <Select
                          label="Sub-categories"
                          selectionMode="multiple"
                          value={selectedSubCategories}
                          placeholder="Select Sub-categories"
                          selectedKeys={new Set(selectedSubCategories)}
                          onSelectionChange={(keys) => {
                            handleSubCategoryArray(keys);
                            field.onChange([...keys]);
                          }}
                        >
                          {subCategoryList[selectedCategory]?.map((subCategory) => (
                            <SelectItem key={subCategory.key}>
                              {subCategory.label}
                            </SelectItem>
                          ))}
                        </Select>

                        {/* Conditional Error Display */}
                        {errors.subCategories ? (
                          <p className="text-red-600 text-left">{errors.subCategories.message}</p>
                        ) : (
                          sizeError4 && <p className="text-red-600 text-left">Sub-Category is required.</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}

              <label htmlFor='availableColors' className='flex justify-start font-medium text-[#9F5216]'>Select Available Colors *</label>
              <Controller
                name="availableColors"
                control={control}
                defaultValue={selectedAvailableColors}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="parent-container">
                    <ReactSelect
                      {...field}
                      options={colorList}
                      isMulti
                      className="w-full border rounded-md creatable-select-container"
                      components={{ Option: ColorOption }}
                      menuPortalTarget={menuPortalTarget}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      menuPlacement="auto"
                      value={selectedAvailableColors}
                      onChange={(newValue) => {
                        setSelectedAvailableColors(newValue);
                        field.onChange(newValue);
                      }}
                    />
                  </div>
                )}
              />
              {errors.availableColors && (
                <p className="text-red-600 text-left">Colors are required</p>
              )}

              <Controller
                name="newArrival"
                control={control}
                defaultValue={selectedNewArrival}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col gap-3">
                    <RadioGroup
                      {...field}
                      label="Is New Arrival?"
                      value={selectedNewArrival}
                      onValueChange={setSelectedNewArrival}
                      orientation="horizontal"
                    >
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="No">No</Radio>
                    </RadioGroup>
                    <p className="text-default-500 text-small">Selected: {selectedNewArrival}</p>
                    {errors.newArrival && (
                      <p className="text-red-600 text-left">New Arrival Selection is required</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="trending"
                control={control}
                defaultValue={isTrending}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col gap-3">
                    <RadioGroup
                      {...field}
                      label="Is Trending?"
                      value={isTrending}
                      onValueChange={setIsTrending}
                      orientation="horizontal"
                    >
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="No">No</Radio>
                    </RadioGroup>
                    <p className="text-default-500 text-small">Selected: {isTrending}</p>
                    {errors.trending && (
                      <p className="text-red-600 text-left">Trending Selection is required</p>
                    )}
                  </div>
                )}
              />

            </div>

            <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
              <label htmlFor='materialCare' className='flex justify-start font-medium text-[#9F5216]'>Material Care</label>
              <Controller
                name="materialCare"
                defaultValue=""
                control={control}
                render={() => <Editor
                  value={materialCare}
                  onChange={(value) => {
                    setMaterialCare(value);
                    localStorage.setItem('materialCare', value); // Update local storage
                  }}
                />}
              />

              <label htmlFor='sizeFit' className='flex justify-start font-medium text-[#9F5216]'>Size Fit</label>
              <Controller
                name="sizeFit"
                defaultValue=""
                control={control}
                render={() => <Editor
                  value={sizeFit}
                  onChange={(value) => {
                    setSizeFit(value);
                    localStorage.setItem('sizeFit', value); // Update local storage
                  }}
                />}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 lg:col-span-5 gap-8 px-6 py-3'>
            <div className='flex flex-col gap-4 h-fit'>
              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                <div>
                  <label htmlFor='regularPrice' className='flex justify-start font-medium text-[#9F5216] mt-4'>Regular Price ৳ *</label>
                  <input id='regularPrice' {...register("regularPrice", { required: true })} className="custom-number-input w-full p-3 border rounded-md border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000" placeholder='Enter Product Price' type="number" />
                  {errors.regularPrice?.type === "required" && (
                    <p className="text-red-600 text-left">Product Price is required</p>
                  )}
                </div>

                <div className="flex w-full flex-col">
                  <Tabs
                    aria-label="Discount Type"
                    selectedKey={discountType}
                    onSelectionChange={handleTabChange}
                  >
                    <Tab key="Percentage" title="Percentage" className='text-[#9F5216]'>Discount (%)</Tab>
                    <Tab key="Flat" title="Flat" className='text-[#9F5216]'>Flat Discount (৳)</Tab>
                  </Tabs>

                  <input
                    type="number"
                    {...register('discountValue')}
                    className='custom-number-input w-full p-3 border rounded-md border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000'
                    placeholder={`Enter ${discountType} Discount`} // Correct placeholder
                  />
                </div>
              </div>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                <div>
                  <label htmlFor={`batchCode`} className='font-medium text-[#9F5216]'>Batch Code *</label>
                  <input
                    id={`batchCode`}
                    autoComplete="off"
                    {...register(`batchCode`, {
                      required: 'Batch Code is required',
                      pattern: {
                        value: /^[A-Z0-9]*$/,
                        message: 'Batch Code must be alphanumeric and uppercase',
                      },
                    })}
                    placeholder={`Enter Batch Code`}
                    className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md mt-2"
                    type="text"
                    onChange={(e) => {
                      // Convert input to uppercase and remove non-alphanumeric characters
                      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    }}
                  />
                  {errors.batchCode && (
                    <p className="text-red-600 text-left">{errors.batchCode.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`weight`} className='font-medium text-[#9F5216]'>Weight (gram)</label>
                  <input
                    id={`weight`}
                    {...register(`weight`)}
                    placeholder={`Enter Weight (gram)`}
                    className="custom-number-input w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md mt-2"
                    type="number"
                  />
                </div>
              </div>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <label htmlFor='tags' className='flex justify-start font-medium text-[#9F5216]'>Select Tag *</label>
                <Controller
                  name="tags"
                  control={control}
                  defaultValue={selectedTags}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="parent-container">
                      <ReactSelect
                        {...field}
                        options={tagList}
                        isMulti
                        className="w-full border rounded-md creatable-select-container"
                        value={selectedTags}
                        menuPortalTarget={menuPortalTarget}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPlacement="auto"
                        onChange={(newValue) => {
                          setSelectedTags(newValue);
                          field.onChange(newValue);
                        }}
                      />
                    </div>
                  )}
                />
                {errors.tags && (
                  <p className="text-red-600 text-left">Tags are required</p>
                )}

                <label htmlFor='vendors' className='flex justify-start font-medium text-[#9F5216]'>Select Vendor</label>
                <Controller
                  name="vendors"
                  control={control}
                  defaultValue={selectedVendors}
                  render={({ field }) => (
                    <div className="parent-container">
                      <ReactSelect
                        {...field}
                        options={vendorList}
                        isMulti
                        className="w-full border rounded-md creatable-select-container"
                        value={selectedVendors}
                        menuPortalTarget={menuPortalTarget}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPlacement="auto"
                        onChange={(newValue) => {
                          setSelectedVendors(newValue);
                          field.onChange(newValue);
                        }}
                      />
                    </div>
                  )}
                />

                <div className="w-full mx-auto" ref={dropdownRef}>
                  {/* Search Box */}
                  <label htmlFor='seasons' className='flex justify-start font-medium text-[#9F5216] pb-2'>Select Collection *</label>

                  <input
                    type="text"
                    value={isDropdownOpen ? searchTerm : selectedSeasons.join(", ")} // Show selected IDs when closed
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={() => setIsDropdownOpen(true)} // dropdown on input click
                    placeholder="Search & Select by Seasonal Collection"
                    className="mb-2 w-full rounded-md border border-gray-300 p-2 outline-none transition-colors duration-1000 focus:border-[#9F5216] overflow-hidden text-ellipsis whitespace-nowrap"
                  />

                  {/* Dropdown list for search results */}
                  {isDropdownOpen && (
                    <div className="border flex flex-col gap-1.5 p-2 max-h-64 overflow-y-auto rounded-lg">
                      {filteredSeasons?.length > 0 ? (
                        filteredSeasons?.map((season) => (
                          <div
                            key={season?._id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedSeasons?.includes(season?.seasonName) ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'}`}
                            onClick={() => toggleSeasonSelection(season?.seasonName)}
                          >
                            <div className='flex items-center gap-1'>
                              <Image
                                width={4000}
                                height={4000}
                                src={season?.imageUrl}
                                alt="season-imageUrl"
                                className="h-8 w-8 object-cover rounded"
                              />
                              <span className="ml-2">{season?.seasonName}</span>
                            </div>
                            <HiCheckCircle
                              className={`pointer-events-none size-7 text-[#60d251] transition-opacity duration-300 ease-in-out ${selectedSeasons?.includes(season?.seasonName) ? "opacity-100" : "opacity-0"}`}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No collection found</p>
                      )}
                    </div>
                  )}

                  {seasonError && <p className="text-red-600 text-left">Season is required</p>}

                </div>

                <div className="w-full mx-auto" ref={dropdownRefForCompleteOutfit}>

                  {/* Search Box */}
                  <label htmlFor='completeOutfit' className='flex justify-start font-medium text-[#9F5216] pb-2'>Complete Your Outfit Section</label>

                  <input
                    type="text"
                    value={isDropdownOpenForCompleteOutfit ? searchTermForCompleteOutfit : selectedProductIds.map(product => product.productId).join(", ")} // Show selected IDs when closed
                    onChange={(e) => setSearchTermForCompleteOutfit(e.target.value)}
                    onClick={() => setIsDropdownOpenForCompleteOutfit(true)} // Toggle dropdown on input click
                    placeholder="Search & Select by Seasonal Collection"
                    className="mb-2 w-full rounded-md border border-gray-300 p-2 outline-none transition-colors duration-1000 focus:border-[#9F5216] overflow-hidden text-ellipsis whitespace-nowrap"
                  />

                  {/* Dropdown list for search results */}
                  {isDropdownOpenForCompleteOutfit && (
                    <div className="border flex flex-col gap-1.5 p-2 max-h-64 overflow-y-auto rounded-lg">
                      {filteredProducts?.length > 0 ? (
                        filteredProducts?.map((product) => (
                          <div
                            key={product?._id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedProductIds?.map(product => product?.productId)?.includes(product?.productId) ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'}`}
                            onClick={() => toggleProductSelection(product?.productId, product?.productTitle, product?._id, product?.thumbnailImageUrl)}>
                            <div className='flex items-center gap-1'>
                              <Image
                                width={4000}
                                height={4000}
                                src={product?.thumbnailImageUrl}
                                alt="season-imageUrl"
                                className="h-8 w-8 object-cover rounded"
                              />
                              <div className='flex flex-col'>
                                <span className="ml-2 font-bold">{product?.productId}</span>
                                <span className="ml-2 text-sm">{product?.productTitle}</span>
                              </div>
                            </div>
                            <HiCheckCircle
                              className={`pointer-events-none size-7 text-[#60d251] transition-opacity duration-300 ease-in-out ${selectedProductIds?.map(product => product?.productId)?.includes(product?.productId) ? "opacity-100" : "opacity-0"}`}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No product found</p>
                      )}
                    </div>
                  )}

                </div>

              </div>

              <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>

                <div className='flex flex-col gap-4'>
                  <input
                    id='imageUpload'
                    type='file'
                    className='hidden'
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor='imageUpload'
                    className={`mx-auto flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed hover:bg-blue-50 ${dragging ? "border-blue-300 bg-blue-50" : "border-gray-400 bg-white"
                      } p-6 cursor-pointer`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <MdOutlineFileUpload size={60} />
                    <div className='space-y-1.5 text-center'>
                      <h5 className='whitespace-nowrap text-lg font-medium tracking-tight'>
                        Upload or Drag Media
                      </h5>
                      <p className='text-sm text-gray-500'>
                        Photo Should be in PNG, JPEG or JPG format
                      </p>
                    </div>
                  </label>
                  {sizeError && (
                    <p className="text-red-600 text-center">Select image</p>
                  )}
                  {image && (
                    <div className='relative'>
                      <Image
                        src={image}
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

        </div>

        <div className='flex justify-end gap-6 px-6 py-8'>

          <button type="button" onClick={handleSubmit(onSaveForNow)} className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700'>
            Save For Now <FiSave size={19} />
          </button>

          <button type='submit' className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'>
            Next Step <FaArrowRight />
          </button>

        </div>

      </form>

      <ExitConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}  // Handle "No" action
        onConfirm={handleConfirmExit}  // Handle "Yes" action
      />

    </div>
  );
};

export default FirstStepOfAddProduct;