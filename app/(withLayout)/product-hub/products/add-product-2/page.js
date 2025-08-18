"use client";
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from "react-hook-form";
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import { FiSave } from 'react-icons/fi';
import useLocations from '@/app/hooks/useLocations';
import Loading from '@/app/components/shared/Loading/Loading';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { LuImagePlus } from "react-icons/lu";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import CustomSwitch from '@/app/components/shared/switch/CustomSwitch';
import ExitConfirmationModal from '@/app/components/product/modal/ExitConfirmationModal';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { MdCancel } from 'react-icons/md';

const SecondStepOfAddProduct = () => {

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [productVariants, setProductVariants] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [navigate, setNavigate] = useState(false);
  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const [locationList, isLocationPending] = useLocations();
  const [showModal, setShowModal] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Function to handle "Go Back" button click
  const handleGoBackClick = (e) => {
    e.preventDefault();  // Prevent immediate navigation
    setShowModal(true);  // Show confirmation modal
  };

  // Handle toggle change and update local storage
  const handleToggleChange = () => {
    setShowInventory((prevState) => {
      const newState = !prevState;
      localStorage.setItem("showInventory", JSON.stringify(newState));
      return newState;
    });
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

  useEffect(() => {
    try {
      const storedColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
      const storedSizes = JSON.parse(localStorage.getItem('allSizes') || '[]');
      const storedVariants = JSON.parse(localStorage.getItem('productVariants') || '[]');
      const storedShowInventory = JSON.parse(localStorage.getItem("showInventory"));
      if (storedShowInventory !== null) {
        setShowInventory(storedShowInventory);
      }

      // Filter locations with status true
      const activeLocations = locationList?.filter(location => location?.status === true);

      // Get the primary location's name from active locations
      const primaryLocationName = activeLocations?.find(location => location?.isPrimaryLocation)?.locationName || '';

      if (storedColors.length === 0 || storedSizes.length === 0) {
        toast.error("Colors or sizes are missing. Please go back and select them.");
        router.push("/product-hub/products/add-product");
        return;
      }

      // Filter to only include variants for the primary location and non-zero SKUs
      const primaryLocationVariants = storedVariants.filter(variant =>
        variant?.location === primaryLocationName
      );

      // Initialize new variants if needed
      const allVariants = [];
      for (const color of storedColors) {
        for (const size of storedSizes) {
          const existingVariant = primaryLocationVariants?.find(variant =>
            variant?.color?.value === color?.value && variant?.size === size
          );

          if (existingVariant) {
            allVariants.push(existingVariant);
          } else {
            allVariants.push({ color, size, sku: 0, onHandSku: 0, imageUrls: [], location: primaryLocationName });
          }
        }
      }

      setProductVariants(allVariants);

      // Set form values for the variants
      // allVariants?.forEach((variant, index) => {
      //   setValue(`sku-${index}`, variant?.sku || 0);
      // });

    } catch (e) {
      console.error(e);
    }
  }, [router, setValue, locationList]);

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

  // Memoize the primary location name based on locationList changes
  const primaryLocationName = useMemo(() => {
    return locationList?.find(location => location?.isPrimaryLocation)?.locationName || 'No primary location found';
  }, [locationList]);

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
      setSizeError(false);
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

  const handleDrop = async (event, variantIndex) => {
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

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleImageRemove = (variantIndex, imgIndex) => {
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

  const onSubmit = (data) => {
    try {

      const invalidVariants = productVariants.filter(
        (variant) => variant.imageUrls.length < 2
      );

      if (invalidVariants.length > 0) {
        toast.error("Each variant must have at least 2 images.");
        return;
      }

      // Filter only locations with status true
      const activeLocations = locationList?.filter(location => location.status === true);

      const formattedData = productVariants.map((variant, index) => {
        return activeLocations?.map(location => ({
          ...variant,
          sku: 0, // Set SKU 0
          onHandSku: 0, // Set SKU 0
          location: location.locationName,
        }));
      });

      // Flatten the array of variants for all locations
      const finalData = formattedData.flat();

      localStorage.setItem('productVariants', JSON.stringify(finalData));
      setNavigate(true);
    } catch (error) {
      toast.error("Failed to save product variants.");
    }
  };

  // New function for "Save for Now" button
  const onSaveForNow = async (formData) => {

    const storedFormattedDate = localStorage.getItem("formattedDate");
    const storedProductTitle = localStorage.getItem('productTitle');
    const storedProductWeight = localStorage.getItem('weight');
    const storedProductBatchCode = localStorage.getItem('batchCode');
    const storedRegularPrice = localStorage.getItem('regularPrice');
    const storedUploadedImageUrl = localStorage.getItem('uploadedImageUrl');
    const storedRestOfOutfit = JSON.parse(localStorage.getItem('restOfOutfit') || '[]');
    const storedDiscountType = localStorage.getItem('discountType');
    const storedDiscountValue = localStorage.getItem('discountValue');
    const storedProductDetails = localStorage.getItem('productDetails');
    const storedMaterialCare = localStorage.getItem('materialCare');
    const storedSizeFit = localStorage.getItem('sizeFit');
    const storedCategory = localStorage.getItem('category');
    const storedSeasons = JSON.parse(localStorage.getItem('season') || '[]');
    const storedSubCategories = JSON.parse(localStorage.getItem('subCategories') || '[]');
    const storedGroupOfSizes = JSON.parse(localStorage.getItem('groupOfSizes') || '[]');
    const storedAllSizes = JSON.parse(localStorage.getItem('allSizes') || '[]');
    const storedAvailableColors = JSON.parse(localStorage.getItem('availableColors') || '[]');
    const storedNewArrival = localStorage.getItem('newArrival');
    const storedIsTrending = localStorage.getItem('trending');
    const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const storedTags = JSON.parse(localStorage.getItem('tags') || '[]');
    const storedProductId = localStorage.getItem('productId');
    const storedSizeGuideImageUrl = localStorage.getItem('sizeGuideImageUrl');
    const storedShowInventory = localStorage.getItem('showInventory');

    // Filter only active locations
    const activeLocations = locationList?.filter(location => location.status === true);

    const formattedData = productVariants?.map((variant, index) => {
      return activeLocations?.map(location => ({
        ...variant,
        sku: 0, // Set SKU to 0
        onHandSku: 0, // Set SKU to 0
        location: location.locationName,
      }));
    });

    // Flatten the array of variants for all locations
    const finalData = formattedData.flat();

    // Check if any variant is missing an image URL
    const invalidVariants = productVariants?.filter(
      (variant) => variant.imageUrls.length < 2
    );

    if (invalidVariants?.length > 0) {
      toast.error("Each variant must have at least 2 images.");
      return;
    }

    const productData = {
      publishDate: storedFormattedDate,
      productTitle: storedProductTitle,
      weight: storedProductWeight,
      batchCode: storedProductBatchCode,
      regularPrice: storedRegularPrice,
      thumbnailImageUrl: storedUploadedImageUrl,
      discountType: storedDiscountType,
      discountValue: storedDiscountValue,
      productDetails: storedProductDetails,
      materialCare: storedMaterialCare,
      sizeFit: storedSizeFit,
      category: storedCategory,
      subCategories: storedSubCategories,
      groupOfSizes: storedGroupOfSizes,
      allSizes: storedAllSizes,
      availableColors: storedAvailableColors,
      newArrival: storedNewArrival,
      trending: storedIsTrending,
      vendors: storedVendors,
      tags: storedTags,
      productId: storedProductId,
      productVariants: finalData,
      season: storedSeasons,
      status: "draft",
      sizeGuideImageUrl: storedSizeGuideImageUrl,
      restOfOutfit: storedRestOfOutfit,
      isInventoryShown: storedShowInventory,
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
        localStorage.removeItem('formattedDate');
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
        localStorage.removeItem('trending');
        JSON.parse(localStorage.removeItem('vendors') || '[]');
        JSON.parse(localStorage.removeItem('tags') || '[]');
        JSON.parse(localStorage.removeItem('productVariants') || '[]');
        JSON.parse(localStorage.removeItem('restOfOutfit') || '[]');
        router.push("/product-hub/products/existing-products");
      }
    } catch (err) {
      toast.error("Failed to save product information");
    }
  };

  useEffect(() => {
    if (navigate) {
      router.push("/product-hub/products/add-product-3");
      setNavigate(false); // Reset the state
    }
  }, [navigate, router]);

  if (isLocationPending) {
    return <Loading />
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6 relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat xl:left-[15%] 2xl:left-[30%] bg-[length:1600px_900px] -top-[90px]'
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
        className='absolute inset-0 z-0 top-8 xl:top-12 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[40%] 2xl:left-[41%] bg-no-repeat'
      />

      <div className='max-w-screen-2xl mx-auto py-3 md:py-4 sticky top-0 z-10 bg-gray-50'>
        <div className='flex flex-wrap lg:flex-nowrap items-center justify-between'>
          <h3 className='flex-1 font-semibold text-lg lg:text-2xl text-neutral-600'>INVENTORY VARIANTS</h3>
          <h3 className='flex-1 font-medium text-sm md:text-base'>Primary Location: <strong>{primaryLocationName}</strong></h3>
          <Link
            className="flex-1 flex items-center gap-2 text-[10px] md:text-base justify-end w-full"
            href="/product-hub/products"
            onClick={handleGoBackClick}  // Trigger the modal on click
          >
            <span className="border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2">
              <FaArrowLeft />
            </span>
            Go Back
          </Link>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='min-h-[86vh] flex flex-col justify-between max-w-screen-2xl mx-auto relative'>
        <div>
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 pt-3 pb-12'>
            {productVariants?.map((variant, index) => (
              <div key={index} className='flex flex-col bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
                <div className='flex items-center gap-2 md:gap-4 h-fit'>
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
                </div>

                <div className='flex flex-col lg:flex-row gap-3 mt-6 h-fit'>
                  <input
                    id={`imageUpload-${index}`}
                    type='file'
                    className='hidden'
                    multiple
                    onChange={(event) => handleImagesChange(event, index)}
                  />
                  {variant?.imageUrls?.length < 6 && (
                    <label
                      htmlFor={`imageUpload-${index}`}
                      className='flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-gray-400 px-3 2xl:px-5 py-6 min-h-[350px] max-h-[350px] bg-white hover:bg-blue-50 cursor-pointer hover:border-blue-300'
                      onDrop={(event) => handleDrop(event, index)}
                      onDragOver={handleDragOver}
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
                  {sizeError && (
                    <p className="text-left text-red-500 font-semibold text-xs pt-2">Please select at least one image</p>
                  )}

                  <div>
                    <DragDropContext onDragEnd={(result) => handleOnDragEnd(result, index)}>
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
                                    <button
                                      type='button'
                                      onClick={() => handleImageRemove(index, imgIndex)}
                                    >
                                      <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                                    </button>
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
                                    <button
                                      type='button'
                                      onClick={() => handleImageRemove(index, imgIndex + 3)}
                                    >
                                      <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                                    </button>
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

        <div className='flex flex-col md:flex-row gap-6 justify-between py-8'>

          <div className='flex-1 flex flex-wrap gap-2 lg:gap-6 w-full'>

            <Link href='/product-hub/products/add-product' className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'>
              <FaArrowLeft /> Previous Step
            </Link>

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
          </div>

          <div className='flex-1 flex flex-wrap items-center justify-end gap-6'>

            <button type="button" onClick={handleSubmit(onSaveForNow)} className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700'>
              Save For Now <FiSave size={19} />
            </button>
            <button type='submit' className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'>
              Next Step <FaArrowRight />
            </button>
          </div>

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

export default SecondStepOfAddProduct;