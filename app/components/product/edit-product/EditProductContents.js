"use client";
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import ColorOption from '@/app/components/product/color/ColorOption';
import Loading from '@/app/components/shared/Loading/Loading';
import useCategories from '@/app/hooks/useCategories';
import useColors from '@/app/hooks/useColors';
import useSizeRanges from '@/app/hooks/useSizeRanges';
import useSubCategories from '@/app/hooks/useSubCategories';
import useTags from '@/app/hooks/useTags';
import useVendors from '@/app/hooks/useVendors';
import { generateSizes } from '@/app/utils/generate-sizes/GenerateSizes';
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Select, SelectItem, Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { LuImagePlus } from "react-icons/lu";
import { Controller, useForm } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa6';
import { MdCancel, MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross1, RxCross2 } from 'react-icons/rx';
import ReactSelect from 'react-select';
import toast from 'react-hot-toast';
import useShippingZones from '@/app/hooks/useShippingZones';
import useShipmentHandlers from '@/app/hooks/useShipmentHandlers';
import { HiOutlineArchive } from "react-icons/hi";
import { RxUpdate } from "react-icons/rx";
import useSeasons from '@/app/hooks/useSeasons';
import useLocations from '@/app/hooks/useLocations';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import { HiCheckCircle } from 'react-icons/hi2';
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { useAuth } from '@/app/contexts/auth';
import DOMPurify from "dompurify";
import { isValidImageFile } from '../../shared/upload/isValidImageFile';
import { CustomCheckbox } from '../checkbox/CustomCheckbox';
import { CustomCheckbox2 } from '../checkbox/CustomCheckbox2';
import CustomSwitch from '../../shared/switch/CustomSwitch';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';

const Editor = dynamic(() => import('@/app/utils/Editor/Editor'), { ssr: false });

const dhakaSuburbs = ["Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi", "Gazipur", "Narayanganj"];

const currentModule = "Product Hub";

const EditProductContents = () => {

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();

  const { id } = useParams(); // Get the route parameter (id)
  const searchParams = useSearchParams();
  const season = searchParams.get("season"); // Get the 'season' query parameter
  const decodedSeasonName = decodeURIComponent(season || ''); // Decode the season name

  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const [productDetails, setProductDetails] = useState("");
  const [materialCare, setMaterialCare] = useState("");
  const [sizeFit, setSizeFit] = useState("");
  const [discountType, setDiscountType] = useState('Percentage');
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [categoryList, isCategoryPending] = useCategories();
  const [sizeRangeList, isSizeRangePending] = useSizeRanges();
  const [subCategoryList, isSubCategoryPending] = useSubCategories();
  const [sizeError, setSizeError] = useState(false);
  const [sizeError2, setSizeError2] = useState(false);
  const [sizeError3, setSizeError3] = useState(false);
  const [sizeError5, setSizeError5] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [newArrivalError, setNewArrivalError] = useState(false);
  const [trendingError, setTrendingError] = useState(false);
  const [menuPortalTarget, setMenuPortalTarget] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedNewArrival, setSelectedNewArrival] = useState("");
  const [isTrending, setIsTrending] = useState("");
  const [selectedAvailableColors, setSelectedAvailableColors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [unselectedGroupSelected2, setUnselectedGroupSelected2] = useState([]);
  const [tagList, isTagPending] = useTags();
  const [vendorList, isVendorPending] = useVendors();
  const [locationList, isLocationPending] = useLocations();
  const [colorList, isColorPending] = useColors();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [groupSelected, setGroupSelected] = React.useState();
  const [groupSelected2, setGroupSelected2] = React.useState();
  const [productVariants, setProductVariants] = useState([]);
  const [shippingList, isShippingPending] = useShippingZones();
  const [shipmentHandlerList, isShipmentHandlerPending] = useShipmentHandlers();
  const [selectedShippingZoneIds, setSelectedShippingZoneIds] = useState([]);
  const [productStatus, setProductStatus] = useState("");
  const [productId, setProductId] = useState("");
  const [seasonList, isSeasonPending] = useSeasons();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [seasonError, setSeasonError] = useState(false);
  const [activeTab, setActiveTab] = useState('product');
  const [existingVariants, setExistingVariants] = useState([]);
  const [productList, isProductPending] = useProductsInformation();
  const [searchTermForCompleteOutfit, setSearchTermForCompleteOutfit] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isDropdownOpenForCompleteOutfit, setIsDropdownOpenForCompleteOutfit] = useState(false);
  const dropdownRefForCompleteOutfit = useRef(null);
  const [activeTab2, setActiveTab2] = useState('Inside Dhaka');
  const [tabSelections, setTabSelections] = useState({});
  const [dragging, setDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isOwner = role === "Owner";
  const { data: session, status } = useSession();

  // Filter categories based on search input and remove already selected categories
  const filteredSeasons = seasonList?.filter((season) => season.seasonName.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.seasonName.localeCompare(b.seasonName)); // Sorting A → Z

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

  // Handle toggle change
  const handleToggleChange = () => {
    setShowInventory((prevState) => !prevState);
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

  // Filtered shipping list for the active tab
  const filteredShippingList = shippingList?.filter((zone) => {
    if (activeTab2 === "Inside Dhaka") return zone?.selectedCity?.includes("Dhaka");
    if (activeTab2 === "Dhaka Suburbs") return zone?.selectedCity?.some((city) => dhakaSuburbs?.includes(city));
    if (activeTab2 === "Outside Dhaka") {
      // Exclude zones in Dhaka and Dhaka Suburbs
      return !zone?.selectedCity?.includes("Dhaka") &&
        !zone?.selectedCity?.some((city) => dhakaSuburbs?.includes(city));
    }
    return false;
  });

  // Unified selection list from all tabs
  const selectedShipmentHandler = Object.values(tabSelections).flat();

  // Toggle selection for an individual item
  const toggleCardSelection = (shipping) => {
    setTabSelections((prev) => {
      const currentTabSelections = prev[activeTab2] || [];
      const isSelected = currentTabSelections.some(
        (item) => item.shippingZone === shipping.shippingZone
      );
      const updatedTabSelections = isSelected
        ? currentTabSelections.filter(
          (item) => item.shippingZone !== shipping.shippingZone
        )
        : [...currentTabSelections, shipping];
      return { ...prev, [activeTab2]: updatedTabSelections };
    });
  };

  // Handle "Select All" for the active tab
  const toggleSelectAll = () => {
    setTabSelections((prev) => {
      const currentTabSelections = prev[activeTab2] || [];
      const allSelected = currentTabSelections.length === filteredShippingList.length;
      return {
        ...prev,
        [activeTab2]: allSelected ? [] : [...filteredShippingList],
      };
    });
  };

  const validateSelections = () => {
    const tabs = ["Inside Dhaka", "Dhaka Suburbs", "Outside Dhaka"];

    // Loop through each tab to check if there are selections
    for (const tab of tabs) {
      // Check if tabSelections for the current tab exists and has items selected
      if (!tabSelections[tab] || tabSelections[tab].length === 0) {
        toast.error(`Select at least one item in the ${tab}`);
        return false;
      }
    }

    return true;
  };

  const handleTabChange2 = (tab) => {
    setActiveTab2(tab);
  };

  const handleCategoryChange = (value) => {
    setValue('category', value, { shouldValidate: true });
    setSelectedCategory(value);
    setGroupSelected([]);
    setGroupSelected2([]);
    setSelectedSubCategories([]);
    setUnselectedGroupSelected2([]);
  };

  const handleSubCategoryArray = (keys) => {
    const selectedArray = [...keys];
    setSelectedSubCategories(selectedArray);
  };

  const handleGroupSelectedChange = (sizes) => {
    if (sizes.length > 1) {
      return; // Prevent selecting more than one size range at a time
    }

    if (sizes.length > 0) {
      setSizeError2(false);
    }

    // Generate sizes based on the selected size range
    // const newRelatedSizes = sizes.flatMap(size => generateSizes(size) || []);
    // setGroupSelected2(newRelatedSizes); // Directly set new sizes

    setGroupSelected(sizes);

    setUnselectedGroupSelected2([]); // Reset previously unselected sizes
    setGroupSelected2([]);

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

    const sortedSizes = sortSizes([...sizes]);

    setGroupSelected2(sortedSizes);

    if (sizes.length > 0) {
      setSizeError3(false);
    }

    setUnselectedGroupSelected2((prevUnselected) => {
      const sizesArray = Array.isArray(sizes) ? sizes : [];
      const newlyUnselected = groupSelected2.filter(size => !sizesArray.includes(size));
      return [...prevUnselected, ...newlyUnselected];
    });
  };

  const handleSelectAll = () => {
    const availableSizes = generateSizes(groupSelected[0] || '');
    setGroupSelected2(availableSizes);
    setSizeError3(false);
  };

  const handleUnselectAll = () => {
    setGroupSelected2([]);
    setSizeError3(false);
  };

  // Ensure groupSelected is an array, default to empty array if undefined
  const safeGroupSelected = Array.isArray(groupSelected) ? groupSelected : [];
  const availableSizes = safeGroupSelected?.length > 0 ? generateSizes(safeGroupSelected[0]) : [];
  const allSelected = availableSizes?.length > 0 && groupSelected2?.length === availableSizes?.length;
  const noneSelected = groupSelected2?.length === 0;

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

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setImage({
        src: URL.createObjectURL(file),
        file,
      });
    }
  };

  const handleImagesChange = async (event, variantIndex) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      toast.error("No files selected.");
      return;
    }

    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (PNG, JPEG, JPG, WEBP).");
      return;
    }

    const currentImages = productVariants[variantIndex]?.imageUrls || [];
    const totalImages = currentImages.length + validFiles.length;

    if (totalImages > 6) {
      toast.error("You can only upload a maximum of 6 images per variant.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    const imageUrls = await uploadMultipleFilesToGCS(newImages);

    setProductVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].imageUrls = [
        ...currentImages,
        ...imageUrls,
      ].slice(0, 6);
      return updatedVariants;
    });
  };

  const processFiles = async (files) => {
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (PNG, JPEG, JPG).");
      return;
    }

    const totalImages = validFiles.length + uploadedImageUrls.length;
    if (totalImages > 6) {
      toast.error("You can only upload a maximum of 6 images.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    const imageUrls = await uploadMultipleFilesToGCS(newImages);
    const updatedUrls = [...uploadedImageUrls, ...imageUrls];

    const limitedUrls = updatedUrls.slice(-6);
    setUploadedImageUrls(limitedUrls);

    // Clear size error if there are valid images
    if (limitedUrls.length > 0) {
      setSizeError5(false);
    }
  };

  const validateFiles = (files) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    return files.filter(file => validTypes.includes(file.type));
  };

  const uploadMultipleFilesToGCS = async (images) => {
    try {
      const formData = new FormData();

      for (const image of images) {
        formData.append('file', image.file); // ✅ correctly send the File object
      }
      const response = await axiosSecure.post('/upload-multiple-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.urls) {
        return response.data.urls; // Expected to be an array of public URLs
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      return [];
    }
  };

  const handleDrops = async (event, variantIndex) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);

    // After processing files, update the variant's imageUrls
    const validFiles = validateFiles(files);
    const currentImages = productVariants[variantIndex]?.imageUrls || [];
    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    const imageUrls = await uploadMultipleFilesToGCS(newImages);

    setProductVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].imageUrls = [
        ...currentImages,
        ...imageUrls,
      ].slice(0, 6); // Limit to 6 images
      return updatedVariants;
    });
  };

  const handleDragOvers = (event) => {
    event.preventDefault();
  };

  const handleImageRemoves = (variantIndex, imgIndex) => {
    setProductVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants[variantIndex].imageUrls = updatedVariants[variantIndex].imageUrls.filter(
        (_, index) => index !== imgIndex
      );
      return updatedVariants;
    });
  };

  const handleOnDragEnd = (result, variantIndex) => {
    const { source, destination } = result;

    if (!destination) return;

    setProductVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];
      const items = [...updatedVariants[variantIndex].imageUrls];

      // Remove the dragged item
      const [movedItem] = items.splice(source.index, 1);

      // Insert the dragged item at the destination
      items.splice(destination.index, 0, movedItem);

      // Update the variant's imageUrls array
      updatedVariants[variantIndex].imageUrls = items;

      return updatedVariants;
    });
  };

  const handleTabChange = (key) => {
    setDiscountType(key);
  };

  // Memoize the primary location name based on locationList changes
  const primaryLocationName = useMemo(() => {
    return locationList?.find(location => location?.isPrimaryLocation)?.locationName || 'No primary location found';
  }, [locationList]);

  const initializeVariants = useCallback((colors, sizes, savedVariants) => {

    // Filter active locations and find the primary location's name
    const activeLocations = locationList?.filter(location => location.status) || [];

    // Get the primary location's name
    const primaryLocationName = activeLocations?.find(location => location?.isPrimaryLocation)?.locationName || '';

    // Filter saved variants based on available colors, sizes, and primary location
    const variants = savedVariants?.filter(variant =>
      variant?.location === primaryLocationName &&
      sizes?.includes(variant.size) &&
      colors?.some(color => color?.value === variant?.color?.value)
    );

    // Add new variants for new sizes or colors
    for (const color of colors) {
      for (const size of sizes) {
        if (!variants.some(variant => variant?.color?.value === color?.value && variant?.size === size)) {
          variants.push({ color, size, sku: "", onHandSku: "", imageUrls: [], location: primaryLocationName });
        }
      }
    }

    // Avoid re-setting the productVariants if nothing has changed to prevent loops
    setProductVariants((prevVariants) => {
      if (JSON.stringify(prevVariants) !== JSON.stringify(variants)) {
        return variants;
      }
      return prevVariants; // No change
    });

    // Set form values for each variant
    variants?.forEach((variant, index) => {
      setValue(`sku-${index}`, variant?.sku);
    });

  }, [setValue, locationList]);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchProductDetails = async () => {
      try {
        const { data } = await axiosPublic.get(`/singleProduct/${id}`);

        setValue('productTitle', data?.productTitle);
        setValue('batchCode', data?.batchCode);
        setValue('weight', data?.weight);
        setValue('regularPrice', data?.regularPrice);
        setValue('discountValue', data?.discountValue);
        setValue('productDetails', data?.productDetails);
        setImage(data?.thumbnailImageUrl);
        setDiscountType(data?.discountType);
        setProductDetails(data?.productDetails);
        setMaterialCare(data?.materialCare);
        setSizeFit(data?.sizeFit);
        setSelectedCategory(data?.category);
        setValue('category', data?.category);
        setSelectedSubCategories(data?.subCategories);
        setGroupSelected(data?.groupOfSizes);
        setGroupSelected2(data?.allSizes);
        setSelectedAvailableColors(data?.availableColors);
        setSelectedNewArrival(data?.newArrival);
        setIsTrending(data?.trending);
        setSelectedVendors(data?.vendors);
        setSelectedTags(data?.tags);
        initializeVariants(data?.availableColors || [], data?.allSizes || [], data?.productVariants || []);
        setProductId(data?.productId);
        setProductStatus(data?.status);
        setSelectedSeasons(data?.season || []);
        setSelectedProductIds(data?.restOfOutfit || []);
        setShowInventory(data?.isInventoryShown);
        setSelectedShippingZoneIds(data?.selectedShippingZoneIds);

        // Assuming existingData.productVariants contains variants for all locations
        setExistingVariants(data?.productVariants); // Store all variants

      } catch (error) {
        // toast.error("Failed to load product details.");
        if (decodedSeasonName) {
          router.push(`/product-hub/products/existing-products/seasons/${decodedSeasonName}`);
          return;
        }
        else {
          router.push(`/product-hub/products/existing-products/${selectedCategory}`);
        }
      }
    };

    fetchProductDetails();
  }, [id, setValue, axiosPublic, initializeVariants, primaryLocationName, session?.user?.accessToken, status, router, decodedSeasonName, selectedCategory]);

  // Only reinitialize variants when colors or sizes change, not productVariants itself
  useEffect(() => {
    if (selectedAvailableColors.length > 0 && groupSelected2.length > 0) {
      initializeVariants(selectedAvailableColors, groupSelected2, productVariants);
    }
  }, [selectedAvailableColors, groupSelected2, initializeVariants, productVariants]);

  // const handleVariantChange = (index, field, value) => {
  //   const updatedVariants = [...productVariants];

  //   // Update the field value
  //   updatedVariants[index][field] = value;

  //   // If the field is 'sku', update 'onHandSku' with the same value
  //   if (field === "sku") {
  //     updatedVariants[index]["onHandSku"] = value;
  //   }

  //   setProductVariants(updatedVariants);
  // };

  const handleColorChange = (newValue) => {
    setSelectedAvailableColors(newValue);
    if (newValue.length === 0) {
      setColorError(true);  // Show error if no color is selected
    } else {
      setColorError(false); // Hide error if at least one color is selected
    }
  };

  const handleVendorChange = (newValue) => {
    setSelectedVendors(newValue);
  };

  const handleTagChange = (newValue) => {
    setSelectedTags(newValue);
    if (newValue.length === 0) {
      setTagError(true);  // Show error if no color is selected
    } else {
      setTagError(false); // Hide error if at least one color is selected
    }
  };

  const handleNewArrivalChange = (newValue) => {
    setSelectedNewArrival(newValue);
    if (newValue) {
      setNewArrivalError(false);  // Show error if no color is selected
    } else {
      setNewArrivalError(true); // Hide error if at least one color is selected
    }
  };

  const handleTrendingChange = (newValue) => {
    setIsTrending(newValue);
    if (newValue) {
      setTrendingError(false);  // Show error if no color is selected
    } else {
      setTrendingError(true); // Hide error if at least one color is selected
    }
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

  useEffect(() => {
    if (!shippingList || !selectedShippingZoneIds?.length) return;

    const dhakaSuburb = ["Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi", "Gazipur", "Narayanganj"];

    const groupedSelections = {
      "Inside Dhaka": [],
      "Dhaka Suburbs": [],
      "Outside Dhaka": [],
    };

    const selectedZones = shippingList.filter(zone =>
      selectedShippingZoneIds.includes(zone._id)
    );

    selectedZones.forEach((shipping) => {
      if (shipping?.selectedCity?.includes("Dhaka")) {
        groupedSelections["Inside Dhaka"].push({ ...shipping, selected: true });
      } else if (shipping?.selectedCity?.some(city => dhakaSuburb.includes(city))) {
        groupedSelections["Dhaka Suburbs"].push({ ...shipping, selected: true });
      } else {
        groupedSelections["Outside Dhaka"].push({ ...shipping, selected: true });
      }
    });

    setTabSelections(groupedSelections);
  }, [shippingList, selectedShippingZoneIds]);

  const onSubmit = async (data) => {

    if (!validateSelections()) return;

    try {

      // Product details validation
      const strippedText = DOMPurify.sanitize(data?.productDetails, { ALLOWED_TAGS: [] }).trim();
      if (!strippedText) {
        toast.error("Product details are required.");
        return;
      }
      if (strippedText.length < 10) {
        toast.error("Product details must be at least 10 characters.");
        return;
      }

      if (!image) {
        setSizeError(true);
        toast.error("Please upload a thumbnail!")
        return;
      }
      setSizeError(false);

      if (groupSelected.length === 0) {
        setSizeError2(true);
        toast.error("Please select at least one size range.");
        return;
      }
      setSizeError2(false);
      if (groupSelected2.length === 0) {
        setSizeError3(true);
        toast.error("Please select at least one size.");
        return;
      }
      setSizeError3(false);

      if (selectedAvailableColors.length === 0) {
        setColorError(true);
        toast.error("Colors are required");
        return;
      }
      setColorError(false);

      if (selectedTags.length === 0) {
        setTagError(true);
        toast.error("Tags are required");
        return;
      }
      setTagError(false);

      if (selectedNewArrival === '') {
        setNewArrivalError(true);
        toast.error("New Arrival selection is required");
        return;
      }
      setNewArrivalError(false);

      if (isTrending === '') {
        setTrendingError(true);
        toast.error("Trending selection is required");
        return;
      }
      setTrendingError(false);

      if (selectedSeasons?.length === 0) {
        setSeasonError(true);
        toast.error("Season is required");
        return;
      }
      setSeasonError(false);

      // Check if any variant is missing an image URL
      const invalidVariants = productVariants?.filter(
        (variant) => variant.imageUrls.length < 2
      );

      if (invalidVariants?.length > 0) {
        toast.error("Each variant must have at least 2 images.");
        return;
      }

      // Initialize an array to hold error messages
      let errors = [];

      // Validate based on the active tab
      if (activeTab === "inventory" || activeTab === "shipping") {
        // Check required fields for product tab
        if (!data.productTitle) errors.push("Title is required.");
        if (!data.regularPrice) errors.push("Regular price is required.");
        if (!data.batchCode) errors.push("Batch code is required.");
      }

      // If there are errors, set an error state and return
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return; // Prevent submission
      }

      // Filter active locations
      const activeLocations = locationList?.filter(location => location.status === true) || [];

      // Initialize an array to hold final data
      const finalData = [];

      // let isSkuUpdated = false;

      // Iterate over productVariants
      productVariants?.forEach((variant, index) => {
        // Process active locations
        activeLocations.forEach(location => {
          // Check if this variant already exists for this location
          const existingVariant = existingVariants?.find(existing =>
            existing.color.value === variant.color.value &&
            existing.size === variant.size &&
            existing.location === location.locationName
          );

          // Use primary location's imageUrls for all locations
          const primaryImageUrls = variant.imageUrls || [];

          // Initialize SKU for the current variant
          let sku = 0; // Default SKU for new active locations
          let onHandSku = 0; // Default SKU for new active locations

          // Preserve whatever SKU exists already
          if (existingVariant) {
            sku = existingVariant.sku;
            onHandSku = existingVariant.onHandSku;
          }

          // Add the variant to finalData
          finalData.push({
            color: variant.color,
            size: variant.size,
            sku,
            onHandSku,
            imageUrls: primaryImageUrls, // Use the same imageUrls for all locations
            location: location.locationName,
          });
        });
      });

      // Handle non-active locations
      const nonActiveLocations = locationList?.filter(location => !location.status) || [];

      // Iterate over existingVariants to check for non-active locations
      existingVariants?.forEach(existing => {
        // Check if the existing variant is for a non-active location
        const isNonActiveLocation = nonActiveLocations.some(location =>
          existing.location === location.locationName
        );

        // If the existing variant is for a non-active location, add it to finalData
        if (isNonActiveLocation) {
          finalData.push(existing);
        }
      });
      const selectedShippingZoneIds = selectedShipmentHandler.map(zone => zone._id);

      const updatedProductData = {
        productTitle: data?.productTitle,
        regularPrice: data?.regularPrice,
        weight: data?.weight,
        batchCode: data?.batchCode,
        thumbnailImageUrl: image,
        discountType: discountType,
        discountValue: data?.discountValue,
        productDetails: productDetails,
        materialCare: materialCare,
        sizeFit: sizeFit,
        category: selectedCategory,
        subCategories: selectedSubCategories,
        groupOfSizes: groupSelected,
        allSizes: groupSelected2,
        availableColors: selectedAvailableColors,
        newArrival: selectedNewArrival,
        trending: isTrending,
        vendors: selectedVendors,
        tags: selectedTags,
        productVariants: finalData,
        selectedShippingZoneIds,
        status: data?.status,
        season: selectedSeasons,
        sizeGuideImageUrl: selectedImageUrl,
        restOfOutfit: selectedProductIds,
        isInventoryShown: showInventory,
      };

      const res = await axiosSecure.put(`/editProductDetails/${id}`, updatedProductData);
      if (res.data.success) {
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
                    Product Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {/* {
                      isSkuUpdated ?
                        `SKU updated in ${primaryLocationName}.` :
                        "Product Details updated successfully!"
                    } */}
                    Product Details updated successfully!
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
        if (decodedSeasonName) {
          router.push(`/product-hub/products/existing-products/seasons/${decodedSeasonName}`);
          return;
        }
        else {
          router.push(`/product-hub/products/existing-products/${selectedCategory}`);
        }
      } else {
        toast.error('No changes detected!');
      }

    } catch (err) {
      toast.error("Failed to publish product details!");
    }
  };

  if (isCategoryPending || isSizeRangePending || isSubCategoryPending || isTagPending || isVendorPending || isColorPending || isShippingPending || isShipmentHandlerPending || isSeasonPending || isLocationPending || isProductPending || isUserLoading || status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

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

      <div className='max-w-screen-2xl mx-auto sticky top-0 px-6 py-2 md:px-6 md:py-6 z-10 bg-gray-50 flex justify-between items-center flex-wrap gap-4'>

        <div className="flex-1 flex items-center gap-3 w-full">

          <button className={`relative py-1 transition-all duration-300
            ${activeTab === 'product' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
            after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
            after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
            ${activeTab === 'product' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('product')}>
            Product
          </button>

          <button className={`relative py-1 transition-all duration-300
          ${activeTab === 'inventory' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
          after:absolute after:left-0 after:right-0 after:bottom-0 
          after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
          ${activeTab === 'inventory' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('inventory')}>
            Inventory
          </button>

          <button className={`relative py-1 transition-all duration-300
          ${activeTab === 'shipping' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
          after:absolute after:left-0 after:right-0 after:bottom-0 
          after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
          ${activeTab === 'shipping' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('shipping')}>
            Shipping
          </button>

        </div>

        <div className='flex-1'>
          {decodedSeasonName ? (
            <Link
              className='flex items-center gap-2 text-[10px] md:text-base justify-end'
              href={`/product-hub/products/existing-products/seasons/${decodedSeasonName}`}>
              <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'>
                <FaArrowLeft />
              </span>
              Go Back
            </Link>
          ) : (
            <Link
              className='flex items-center gap-2 text-[10px] md:text-base justify-end'
              href={`/product-hub/products/existing-products/${selectedCategory}`}>
              <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'>
                <FaArrowLeft />
              </span>
              Go Back
            </Link>
          )}
        </div>

      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {activeTab === "product" &&
          <div className='relative'>
            <div className='max-w-screen-2xl px-6 mx-auto pb-3'>
              <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>UPDATE PRODUCT DETAILS</h3>
            </div>

            <div className='max-w-screen-2xl mx-auto'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6'>
                <div className='grid grid-cols-1 lg:col-span-7 xl:col-span-7 gap-8 px-6 py-3 h-fit'>
                  <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
                    <p className='w-full text-xl text-neutral-700'>PRODUCT ID: <strong>{productId}</strong></p>

                    <div>
                      <label htmlFor='productTitle' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Product Title <span className="text-red-600 pl-1">*</span></label>
                      <input id='productTitle' {...register("productTitle", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" placeholder='Enter Product Title' type="text" />
                      {errors.productTitle?.type === "required" && (
                        <p className="text-left pt-2 text-red-500 font-semibold text-xs">Product Title is required</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor='productDetails' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Details About This Product <span className="text-red-600 pl-1">*</span></label>
                      <Controller
                        name="productDetails"
                        defaultValue=""
                        control={control}
                        rules={{
                          required: "Product details are required.",
                          validate: (value) => {
                            const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                            return strippedText.length >= 10 || "Product details must be at least 10 characters.";
                          },
                        }}
                        render={({ field }) => <Editor
                          // value={productDetails}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            setProductDetails(value);
                          }}
                        />}
                      />
                      {errors.productDetails && (
                        <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.productDetails.message}</p>
                      )}
                    </div>

                  </div>

                  <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                    <div className='flex flex-col rounded-md relative'>
                      <label htmlFor="category" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Category <span className="text-red-600 pl-1">*</span></label>
                      <select
                        id="category"
                        className={`bg-gray-100 p-2 rounded-md ${errors.category ? 'border-red-600' : ''}`}
                        value={selectedCategory}
                        {...register('category', { required: 'Category is required' })}
                        onChange={(e) => {
                          handleCategoryChange(e.target.value);
                        }}
                        disabled
                      >
                        <option value="" disabled className='bg-white'>Select a category</option>
                        {categoryList?.map((category) => (
                          <option className='bg-white' key={category.key} value={category.label}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.category.message}</p>
                      )}
                    </div>

                    {selectedCategory && sizeRangeList[selectedCategory] && (
                      <div className="flex flex-col w-full">

                        <div className='flex justify-between items-center'>
                          <CheckboxGroup
                            className="gap-1"
                            label={<p className="font-semibold text-neutral-500 text-sm pb-1">Select size range <span className="text-red-600 pl-1">*</span></p>}
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
                          {groupSelected?.length > 0 && (
                            <div className="flex gap-2 mt-6">
                              {!allSelected && (
                                <button
                                  type="button"
                                  className="relative z-[1] flex items-center gap-x-2 rounded-lg bg-[#ffddc2] px-3 py-1.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-sm text-neutral-700"
                                  onClick={handleSelectAll}
                                >
                                  <MdCheckBox size={16} /> Select All
                                </button>
                              )}
                              {!noneSelected && (
                                <button
                                  type="button"
                                  className="relative z-[1] flex items-center gap-x-2 rounded-lg bg-[#d4ffce] px-3 py-1.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-sm text-neutral-700"
                                  onClick={handleUnselectAll}
                                >
                                  <MdCheckBoxOutlineBlank size={16} /> Unselect All
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {sizeError2 && (
                          <p className="text-left pt-2 text-red-500 font-semibold text-xs">Please select at least one size.</p>
                        )}

                      </div>
                    )}

                    {groupSelected?.length > 0 && (
                      <div className="flex flex-col w-full">
                        <CheckboxGroup
                          className="gap-1"
                          label={<p className="font-semibold text-neutral-500 text-sm pb-1">Deselect sizes <span className="text-red-600 pl-1">*</span></p>}
                          orientation="horizontal"
                          value={groupSelected2}
                          onChange={handleGroupSelected2Change}
                        >
                          {generateSizes(groupSelected[0] || '')?.map(size => (
                            <CustomCheckbox2 key={size} value={size}>{size}</CustomCheckbox2>
                          ))}
                        </CheckboxGroup>
                        <p className="my-2 ml-1 text-default-500 text-sm font-semibold">
                          Selected: <span>{groupSelected2?.join(", ")}</span>
                        </p>
                        {sizeError3 && (
                          <p className="text-left text-red-500 font-semibold text-xs">Please select at least one size.</p>
                        )}
                      </div>
                    )}

                    {groupSelected2?.length > 0 && (
                      <div className="flex w-full flex-col gap-2">
                        <Controller
                          name="subCategories"
                          control={control}
                          defaultValue={selectedSubCategories}
                          render={({ field }) => (
                            <div>
                              <Select
                                label={<p className="font-semibold text-neutral-500 text-sm">Sub Category</p>}
                                selectionMode="multiple"
                                value={selectedSubCategories}
                                placeholder="Select Sub Categories"
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
                            </div>
                          )}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor='availableColors' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select Available Colors <span className="text-red-600 pl-1">*</span></label>
                      <div className="parent-container">
                        <ReactSelect
                          options={colorList}
                          isMulti
                          className="w-full border rounded-md creatable-select-container"
                          components={{ Option: ColorOption }}
                          menuPortalTarget={menuPortalTarget}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          menuPlacement="auto"
                          value={selectedAvailableColors}
                          onChange={handleColorChange}
                        />
                      </div>
                      {colorError && (
                        <p className="text-left pt-2 text-red-500 font-semibold text-xs">Colors are required</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <RadioGroup
                        label={<p className="font-semibold text-neutral-500 text-sm">Is New Arrival? <span className="text-red-600 pl-1">*</span></p>}
                        value={selectedNewArrival}
                        onValueChange={handleNewArrivalChange}
                        orientation="horizontal"
                      >
                        <Radio value="Yes">Yes</Radio>
                        <Radio value="No">No</Radio>
                      </RadioGroup>
                      <p className="text-default-500 text-small">Selected: {selectedNewArrival}</p>
                      {newArrivalError && (
                        <p className="text-left text-red-500 font-semibold text-xs">New Arrival Selection is required</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <RadioGroup
                        label={<p className="font-semibold text-neutral-500 text-sm">Is Trending? <span className="text-red-600 pl-1">*</span></p>}
                        value={isTrending}
                        onValueChange={handleTrendingChange}
                        orientation="horizontal"
                      >
                        <Radio value="Yes">Yes</Radio>
                        <Radio value="No">No</Radio>
                      </RadioGroup>
                      <p className="text-default-500 text-small">Selected: {isTrending}</p>
                      {trendingError && (
                        <p className="text-left text-red-500 font-semibold text-xs">Trending Selection is required</p>
                      )}
                    </div>

                  </div>

                  <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                    <div>
                      <label htmlFor='materialCare' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Material Care</label>
                      <Controller
                        name="materialCare"
                        defaultValue=""
                        control={control}
                        render={() => <Editor
                          value={materialCare}
                          onChange={(value) => {
                            setMaterialCare(value);
                          }}
                        />}
                      />
                    </div>

                    <div>
                      <label htmlFor='sizeFit' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Size Fit</label>
                      <Controller
                        name="sizeFit"
                        defaultValue=""
                        control={control}
                        render={() => <Editor
                          value={sizeFit}
                          onChange={(value) => {
                            setSizeFit(value);
                          }}
                        />}
                      />
                    </div>

                  </div>
                </div>

                <div className='grid grid-cols-1 lg:col-span-5 xl:col-span-5 gap-8 px-6 py-3'>
                  <div className='flex flex-col gap-4 h-fit'>
                    <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                      <div>
                        <label htmlFor="regularPrice" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Regular Price ৳ <span className="text-red-600 pl-1">*</span></label>
                        <input id='regularPrice' {...register("regularPrice", { required: true })} className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold" placeholder='Enter Product Price' type="number" />
                        {errors.regularPrice?.type === "required" && (
                          <p className="text-left pt-2 text-red-500 font-semibold text-xs">Product Price is required</p>
                        )}
                      </div>

                      <div className="flex w-full flex-col">
                        <Tabs isDisabled={!isOwner}
                          aria-label="Discount Type"
                          selectedKey={discountType}
                          onSelectionChange={handleTabChange}
                        >
                          <Tab key="Percentage" title="Percentage"><span className='font-semibold text-neutral-500 text-sm'>Discount (%)</span></Tab>
                          <Tab key="Flat" title="Flat"><span className='font-semibold text-neutral-500 text-sm'>Flat Discount (৳)</span></Tab>
                        </Tabs>

                        <input
                          type="number"
                          disabled={!isOwner}
                          {...register('discountValue')}
                          className='custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold'
                          placeholder={`Enter ${discountType} Discount`} // Correct placeholder
                        />
                      </div>
                    </div>

                    <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                      <div>
                        <label htmlFor="batchCode" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Batch Code <span className="text-red-600 pl-1">*</span></label>
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
                          className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                          type="text"
                          onChange={(e) => {
                            // Convert input to uppercase and remove non-alphanumeric characters
                            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          }}
                        />
                        {errors.batchCode && (
                          <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.batchCode.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="weight" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Weight (gram)</label>
                        <input
                          id={`weight`}
                          {...register(`weight`)}
                          placeholder={`Enter Weight`}
                          className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>

                      <div>
                        <label htmlFor="tags" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select Tag <span className="text-red-600 pl-1">*</span></label>
                        <div className="parent-container">
                          <ReactSelect
                            options={tagList}
                            isMulti
                            className="w-full border rounded-md creatable-select-container"
                            value={selectedTags}
                            menuPortalTarget={menuPortalTarget}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPlacement="auto"
                            onChange={handleTagChange}
                          />
                        </div>
                        {tagError && (
                          <p className="text-left pt-2 text-red-500 font-semibold text-xs">Tags are required</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="vendors" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select Vendor</label>
                        <div className="parent-container">
                          <ReactSelect
                            options={vendorList}
                            isMulti
                            className="w-full border rounded-md creatable-select-container"
                            value={selectedVendors}
                            menuPortalTarget={menuPortalTarget}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPlacement="auto"
                            onChange={handleVendorChange}
                          />
                        </div>
                      </div>

                      <div className="w-full mx-auto" ref={dropdownRef}>

                        {/* Search Box */}
                        <label htmlFor='seasons' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Select Collection <span className="text-red-600 pl-1">*</span></label>

                        <input
                          type="text"
                          value={isDropdownOpen ? searchTerm : selectedSeasons.join(", ")} // Show selected IDs when closed
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={() => setIsDropdownOpen(true)} // dropdown on input click
                          placeholder="Search & Select by Seasonal Collection"
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        />

                        {/* Dropdown list for search results */}
                        {isDropdownOpen && (
                          <div className="border flex flex-col gap-1.5 p-2 max-h-64 overflow-y-auto rounded-lg">
                            {filteredSeasons?.length > 0 ? (
                              filteredSeasons?.map((season) => (
                                <div
                                  key={season._id}
                                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedSeasons?.includes(season.seasonName) ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'}`}
                                  onClick={() => toggleSeasonSelection(season.seasonName)}
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

                        {seasonError && <p className="text-left pt-2 text-red-500 font-semibold text-xs">Season is required</p>}

                      </div>

                      <div className="w-full mx-auto" ref={dropdownRefForCompleteOutfit}>
                        {/* Search Box */}
                        <label htmlFor='completeOutfit' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Complete Your Outfit Section</label>

                        <input
                          type="text"
                          value={isDropdownOpenForCompleteOutfit ? searchTermForCompleteOutfit : selectedProductIds.map(product => product.productId).join(", ")} // Show selected IDs when closed
                          onChange={(e) => setSearchTermForCompleteOutfit(e.target.value)}
                          onClick={() => setIsDropdownOpenForCompleteOutfit(true)} // Toggle dropdown on input click
                          placeholder="Search & Select by Seasonal Collection"
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                        />

                        {/* Dropdown list for search results */}
                        {isDropdownOpenForCompleteOutfit && (
                          <div className="border flex flex-col gap-1.5 p-2 max-h-64 overflow-y-auto rounded-lg">
                            {filteredProducts?.length > 0 ? (
                              filteredProducts?.map((product) => (
                                <div
                                  key={product._id}
                                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedProductIds?.map(product => product?.productId)?.includes(product?.productId) ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'}`}
                                  onClick={() => toggleProductSelection(product?.productId, product?.productTitle, product?._id, product?.thumbnailImageUrl)}
                                >
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

                        <div>
                          <label htmlFor="imageUpload" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Product Thumbnail <span className="text-red-600 pl-1">*</span></label>
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
                              <p className="text-[11px] text-gray-500">Photo Should be in PNG, JPEG or JPG format</p>
                            </div>
                          </label>
                          {sizeError && (
                            <p className="text-left text-red-500 font-semibold text-xs">Select product thumbnail image</p>
                          )}
                        </div>

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
            </div>
          </div>
        }

        {activeTab === "inventory" &&
          <div className='relative'>
            <div className='2xl:max-w-screen-2xl 2xl:mx-auto'>
              <div className='flex flex-wrap items-center justify-between px-6 gap-4 text-neutral-700'>

                <h3 className='font-semibold text-lg lg:text-2xl text-neutral-600'>UPDATE INVENTORY VARIANTS</h3>

                <p className="font-semibold text-lg lg:text-2xl text-neutral-600">
                  {productVariants?.length > 0 ? (
                    `${productVariants.reduce((acc, variant) => acc + Number(variant.sku), 0)} ${productVariants.reduce((acc, variant) => acc + Number(variant.sku), 0) === 1 ? 'Item' : 'Items'}`
                  ) : (
                    'No Items'
                  )}
                </p>

              </div>
              <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 px-6 py-6'>
                {productVariants?.map((variant, index) => (
                  <div key={index} className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                    <div className='flex items-center gap-2 md:gap-4'>
                      <div className='w-1/3'>
                        <label htmlFor="color" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Color</label>
                        <input
                          type="text"
                          value={variant.color.label}
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                          disabled
                        />
                      </div>
                      <div className='w-1/3'>
                        <label htmlFor="size" className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Size</label>
                        <input
                          type="text"
                          value={variant.size}
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                          disabled
                        />
                      </div>
                      <div className='md:w-1/3'>
                        <label htmlFor={`sku-${index}`} className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">SKU</label>
                        <input
                          id={`sku-${index}`}
                          value={variant.sku}
                          disabled
                          className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                          type="number"
                        />
                      </div>
                    </div>
                    <div className='flex flex-col lg:flex-row gap-3 mt-6 h-fit'>
                      <input
                        id={`imageUpload-${index}`}
                        type='file'
                        className='hidden'
                        multiple
                        disabled={!isOwner}
                        onChange={(event) => handleImagesChange(event, index)}
                      />
                      {variant?.imageUrls?.length < 6 && isOwner === true && (
                        <label
                          htmlFor={`imageUpload-${index}`}
                          className='flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-gray-400 px-3 2xl:px-5 py-6 min-h-[350px] max-h-[350px] bg-white hover:bg-blue-50 cursor-pointer hover:border-blue-300'
                          onDrop={(event) => handleDrops(event, index)}
                          onDragOver={handleDragOvers}
                        >
                          <LuImagePlus size={30} />
                          <div className='space-y-1.5 text-center text-neutral-500 font-semibold w-[125px]'>
                            <p className="text-[11px]">
                              <span className="text-blue-300 underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-blue-400">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              Upload at least{" "}
                              <span className="text-blue-300 font-semibold">2 images</span>{" "}
                              (up to{" "}
                              <span className="text-amber-600 font-semibold">6 allowed</span>)
                            </p>
                            <p className="text-[10px]">Max image size : 10 MB</p>
                            <div className='py-1'>
                              <p className="text-[10px] text-gray-500">Required size</p>
                              <p className="text-[10px] text-gray-500">750 (W) x 1000 (H)</p>
                            </div>
                            <p className="text-[10px] text-amber-600 font-semibold pt-1">Transparent background</p>
                          </div>
                        </label>
                      )}
                      {sizeError5 && (
                        <p className="text-left text-red-500 font-semibold text-xs pt-2">Please select at least one image</p>
                      )}

                      <div>

                        <DragDropContext onDragEnd={(result) => {
                          if (isOwner) {
                            handleOnDragEnd(result, index); // Allow dragging only if isOwner is true
                          }
                        }}>
                          <Droppable droppableId="row1" direction="horizontal">
                            {(provided) => (
                              <div
                                className="grid grid-cols-3 gap-4"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {variant.imageUrls?.slice(0, 3).map((url, imgIndex) => (
                                  <Draggable key={url} draggableId={`row1-${url}`} index={imgIndex}>
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center p-2 bg-white border border-gray-300 rounded-md relative"
                                      >
                                        <Image
                                          src={url}
                                          alt={`Variant ${index} Image ${imgIndex}`}
                                          height={3000}
                                          width={3000}
                                          className="w-full h-auto min-h-[150px] max-h-[150px] rounded-md object-cover"
                                        />
                                        {isOwner &&
                                          <button
                                            type='button'
                                            onClick={() => handleImageRemoves(index, imgIndex)}
                                          >
                                            <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                                          </button>
                                        }
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>

                          <Droppable droppableId="row2" direction="horizontal">
                            {(provided) => (
                              <div
                                className="grid grid-cols-3 gap-4 mt-4"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {variant.imageUrls?.slice(3).map((url, imgIndex) => (
                                  <Draggable key={url} draggableId={`row2-${url}`} index={imgIndex + 3}>
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center p-2 bg-white border border-gray-300 rounded-md relative"
                                      >
                                        <Image
                                          src={url}
                                          alt={`Variant ${index} Image ${imgIndex + 3}`}
                                          height={3000}
                                          width={3000}
                                          className="w-full h-auto min-h-[150px] max-h-[150px] rounded-md object-contain"
                                        />
                                        {isOwner &&
                                          <button
                                            type='button'
                                            onClick={() => handleImageRemoves(index, imgIndex + 3)}
                                          >
                                            <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                                          </button>
                                        }
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }

        {activeTab === "shipping" &&
          <div className='2xl:max-w-screen-2xl 2xl:mx-auto relative'>

            <h3 className='font-semibold text-lg lg:text-2xl text-neutral-600 px-6'>UPDATE SHIPPING DETAILS</h3>

            <div className='flex flex-wrap items-center gap-3 mt-2 px-6 pb-6'>

              <button
                type='button'
                className={`relative text-sm py-1 transition-all duration-300
${activeTab2 === 'Inside Dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab2 === 'Inside Dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
                onClick={() => handleTabChange2("Inside Dhaka")}
              >
                Inside Dhaka
              </button>

              <button type='button'
                className={`relative text-sm py-1 transition-all duration-300
${activeTab2 === 'Dhaka Suburbs' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab2 === 'Dhaka Suburbs' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
                onClick={() => handleTabChange2("Dhaka Suburbs")}
              >
                Dhaka Suburbs
              </button>

              <button type='button'
                className={`relative text-sm py-1 transition-all duration-300
${activeTab2 === 'Outside Dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab2 === 'Outside Dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
                onClick={() => handleTabChange2("Outside Dhaka")}
              >
                Outside Dhaka
              </button>

            </div>

            <div className='px-6'>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white">

                  <thead>
                    <tr className={`rounded-lg bg-gray-50`}>
                      <th className="px-2 py-1 md:px-4 md:py-2 border-b border-gray-300">
                        <Checkbox
                          isSelected={filteredShippingList?.length > 0 && (tabSelections[activeTab2]?.length === filteredShippingList?.length)}
                          onChange={toggleSelectAll}
                          color="success"
                          size="md"
                        />
                      </th>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Zone</th>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipment Handlers</th>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Charges</th>
                      <th className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-base border-b border-gray-300">Shipping Hours</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShippingList?.map((shipping, index) => {
                      const isSelected = selectedShipmentHandler?.some(
                        (handler) => handler?.shippingZone === shipping?.shippingZone
                      );

                      const handler = shipmentHandlerList?.find(h => h?._id === shipping?.selectedShipmentHandlerId);

                      // Derive delivery types from shippingCharges keys (or shippingDurations keys)
                      const deliveryTypes = shipping?.shippingCharges ? Object.keys(shipping?.shippingCharges) : [];

                      return (
                        <tr key={index}
                          className={`cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                          {/* Checkbox for selecting a row */}
                          <td className="text-center">
                            <Checkbox
                              isSelected={isSelected}
                              onChange={() => toggleCardSelection(shipping)}
                              color="success"
                              size='md'
                            />
                          </td>

                          {/* Shipping Zone Title */}
                          <td className="text-xs md:text-base text-center font-bold text-gray-900">
                            {shipping?.shippingZone}
                          </td>

                          {/* Shipment Handlers */}
                          <td className="px-2 py-1 md:px-4 md:py-2">
                            <div className="flex items-center justify-center md:gap-4">
                              {handler?.imageUrl && (
                                <Image
                                  src={handler?.imageUrl}
                                  alt="shipping"
                                  width={100}
                                  height={100}
                                  className="mb-2 object-contain h-32 w-32"
                                />
                              )}
                            </div>
                          </td>

                          <td className='text-center font-bold text-gray-900 text-xs md:text-base'>{deliveryTypes?.length > 0 ? (
                            deliveryTypes?.map((type, idx) => (
                              <div key={idx}>
                                {type}: ৳ {shipping?.shippingCharges[type] ?? "—"}
                              </div>
                            ))
                          ) : (
                            "—"
                          )}
                          </td>

                          <td className='text-center font-bold text-gray-900 text-xs md:text-base'>{deliveryTypes?.length > 0 ? (
                            deliveryTypes?.map((type, idx) => (
                              <div key={idx}>
                                {type}: {shipping?.shippingDurations?.[type] ?? "—"} {type === "EXPRESS" ? "hours" : "days"}
                              </div>
                            ))
                          ) : (
                            "—"
                          )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        }

        <div className='2xl:max-w-screen-2xl 2xl:mx-auto flex justify-between px-6 pt-8 pb-16'>

          {productStatus === "active" &&
            <button color="danger" className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700'
              onClick={handleSubmit(async (formData) => {
                // Call onSubmit and wait for the result
                const success = await onSubmit({ ...formData, status: "archive" }).catch(() => false);
                if (success) {
                  setProductStatus("archive"); // Only change status if onSubmit succeeded
                }
              })}
            >
              Archive <HiOutlineArchive size={20} />
            </button>
          }

          <div className='flex items-center justify-end gap-6 w-full'>

            {
              activeTab === "inventory" &&
              <div className="flex items-center gap-2">
                <label htmlFor="show-inventory" className="text-sm font-medium">
                  <span>{showInventory ? "Inventory Details Visible" : "Show Inventory Details"}</span>
                </label>

                <CustomSwitch
                  checked={showInventory}
                  onChange={handleToggleChange}
                  size="md"
                  color="primary"
                />
              </div>
            }

            <button
              type='button'
              className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'
              onClick={handleSubmit((formData) => {
                const newStatus = productStatus === "draft" ? "active" : productStatus; // Change draft to active
                onSubmit({ ...formData, status: newStatus }); // Pass the updated status directly
              })}
            >
              Update <RxUpdate size={18} />
            </button>

            {productStatus === "archive" &&
              <button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700"
                onClick={handleSubmit(async (formData) => {
                  // Call onSubmit and wait for the result
                  const success = await onSubmit({ ...formData, status: "active" }).catch(() => false);
                  if (success) {
                    setProductStatus("active"); // Only change status if onSubmit succeeded
                  }
                })}
              >
                Publish Again <MdOutlineFileUpload size={18} />
              </button>
            }

          </div>
        </div>

      </form>

    </div>
  );
};

export default EditProductContents;