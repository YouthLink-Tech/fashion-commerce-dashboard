"use client";
import DestinationSelect from '@/app/components/product/select/DestinationSelect';
import OriginSelect from '@/app/components/product/select/OriginSelect';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import useProductsInformation from '@/app/hooks/useProductsInformation';
import usePurchaseOrders from '@/app/hooks/usePurchaseOrders';
import useTransferOrders from '@/app/hooks/useTransferOrders';
import { Button, Checkbox, DatePicker, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const CreateTransfer = () => {

  const router = useRouter();
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [dateError, setDateError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [productList, isProductPending] = useProductsInformation();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [transferOrderVariants, setTransferOrderVariants] = useState([]);
  const [purchaseOrderList, isPurchaseOrderPending] = usePurchaseOrders();
  const [transferOrderList, isTransferOrderPending] = useTransferOrders();

  useEffect(() => {
    // Reset selected products whenever origin or destination changes
    setSelectedProducts([]);
  }, [selectedOrigin, selectedDestination]);

  // Update handleVariantChange to initialize values if not set
  const handleVariantChange = (index, field, value, productTitle, size, colorName, colorCode) => {
    setTransferOrderVariants((prevVariants) => {
      const updatedVariants = [...prevVariants];

      // Initialize the variant object if it does not exist
      if (!updatedVariants[index]) {
        updatedVariants[index] = {};
      };

      // Check if the productTitle, size, and color match with the purchaseOrderList
      const matchedItem = purchaseOrderList.filter(po => po.status === "received").flatMap(po => po.purchaseOrderVariants).filter(
        (variant) =>
          variant.productTitle === productTitle &&
          variant.size === size &&
          variant.colorCode === colorCode &&
          variant.colorName === colorName
      );

      const lastMatchedItem = matchedItem[matchedItem.length - 1];

      // Validate the entered quantity against originSku
      const enteredQuantity = parseInt(value, 10); // Parse value to integer
      const originSku = selectedProducts[index]?.originSku; // Get originSku for the product

      if (enteredQuantity > originSku) {
        toast.error(`Entered quantity for ${productTitle} (${colorName}) exceeds available stock ${originSku}`
        );
        return prevVariants; // Prevent updating state if validation fails
      }

      // Set product title, size, and color properties
      if (!updatedVariants[index].productTitle) {
        updatedVariants[index].productTitle = productTitle;
        updatedVariants[index].size = size;

        // Assuming color is an object with code and name properties
        updatedVariants[index].color = {
          code: colorCode,
          name: colorName,
        };
      }

      // Update the specific field (in this case, quantity)
      updatedVariants[index][field] = value;

      // If a match is found in purchaseOrderList, update tax and cost from the last matched item
      if (lastMatchedItem) {
        updatedVariants[index].tax = lastMatchedItem.tax;
        updatedVariants[index].cost = lastMatchedItem.cost;
      }

      return updatedVariants;
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      onOpen(); // Open modal when there's input
    }
  };

  const handleShowDateError = (date) => {
    if (date) {
      setDateError(false);
      return;
    }
    setDateError(true);
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Get month and pad with 0 if needed
    const day = (`0${date.getDate()}`).slice(-2);       // Get day and pad with 0 if needed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Function to calculate total SKU per size and SKU for selected location
  const calculateSkuBySizeAndColorAndLocation = (productList, selectedOrigin, selectedDestination) => {
    if (!productList || !selectedOrigin || !selectedDestination) return [];

    const skuByProduct = [];

    productList.forEach((product) => {
      const skuEntries = [];

      product.productVariants.forEach((variant) => {
        const size = variant.size;
        const colorCode = variant.color?.color;  // Hex code for the color
        const colorName = variant.color?.value;  // Name of the color
        const sku = variant.sku || 0;

        // Find or create an entry in skuEntries for this specific size and color
        let entry = skuEntries.find(
          (e) => e.size === size && e.color.code === colorCode
        );

        if (!entry) {
          // If entry does not exist, initialize it
          entry = {
            size,
            color: { code: colorCode, name: colorName },
            originSku: 0,
            destinationSku: 0,
          };
          skuEntries.push(entry);
        }

        // Increment originSku if the location matches selectedOrigin location
        if (variant.location === selectedOrigin.locationName) {
          entry.originSku += sku;
        }

        // Increment destinationSku if the location matches selectedDestination location
        if (variant.location === selectedDestination.locationName) {
          entry.destinationSku += sku;
        }
      });

      // Push the completed SKU data for each product, including title and image
      skuByProduct.push({
        productTitle: product.productTitle,
        imageUrl: product?.thumbnailImageUrl,
        skuBySizeAndColor: skuEntries,
      });
    });

    return skuByProduct;
  };

  // Function to toggle selection for a specific product size and originSku
  const toggleProductSizeColorSelection = (product, size, colorCode, colorName, originSku, destinationSku) => {
    setSelectedProducts((prevSelectedProducts) => {
      const isSelected = prevSelectedProducts.some(
        (item) =>
          item?.productTitle === product?.productTitle &&
          item?.size === size &&
          item?.color === colorCode &&
          item?.name === colorName &&
          item?.originSku === originSku &&  // Check originSku
          item?.destinationSku === destinationSku // Check destinationSku
      );

      if (isSelected) {
        // Deselect the specific entry
        setTransferOrderVariants((prevVariants) =>
          prevVariants.filter(
            (variant) =>
              !(
                variant?.productTitle === product?.productTitle &&
                variant?.size === size &&
                variant?.color?.code === colorCode &&
                variant?.color?.name === colorName &&
                variant?.originSku === originSku &&  // Check originSku
                variant?.destinationSku === destinationSku // Check destinationSku
              )
          )
        );

        // Reset quantity to 0 for deselected variant
        setTransferOrderVariants((prevVariants) => {
          const updatedVariants = [...prevVariants];

          const variantIndex = updatedVariants.findIndex(
            (variant) =>
              variant.productTitle === product.productTitle &&
              variant.size === size &&
              variant.color.code === colorCode &&
              variant.color.name === colorName &&
              variant.originSku === originSku &&
              variant.destinationSku === destinationSku
          );

          if (variantIndex !== -1) {
            updatedVariants[variantIndex].quantity = 0; // Reset quantity to 0
          }

          return updatedVariants;
        });

        return prevSelectedProducts.filter(
          (item) =>
            !(
              item?.productTitle === product?.productTitle &&
              item?.size === size &&
              item?.color === colorCode &&
              item?.name === colorName &&
              item?.originSku === originSku && // Check originSku
              item?.destinationSku === destinationSku // Check destinationSku
            )
        );
      } else {
        // Select the specific entry and initialize quantity to 0
        setTransferOrderVariants((prevVariants) => [
          ...prevVariants,
          {
            productTitle: product?.productTitle,
            size,
            color: { code: colorCode, name: colorName },
            originSku, // Store originSku
            destinationSku, // Store destinationSku
            quantity: 0, // Initialize quantity to 0
            cost: 0, // Initialize cost to 0
            tax: 0, // Initialize tax to 0
          },
        ]);

        return [
          ...prevSelectedProducts,
          {
            productTitle: product?.productTitle,
            imageUrl: product?.imageUrl,
            size,
            color: colorCode,
            name: colorName,
            originSku, // Store originSku
            destinationSku, // Store destinationSku
          },
        ];
      }
    });
  };

  // Function to toggle selection for all sizes of a product including originSku
  const toggleAllSizesAndColorsForProduct = (product) => {
    setSelectedProducts((prevSelectedProducts) => {
      // Only consider entries that are NOT disabled
      const validEntries = product?.skuBySizeAndColor.filter(entry => entry.originSku !== 0);

      const allSelected = validEntries.every((entry) =>
        prevSelectedProducts.some(
          (item) =>
            item?.productTitle === product?.productTitle &&
            item?.size === entry?.size &&
            item?.color === entry?.color?.code &&
            item?.name === entry?.color?.name &&
            item?.originSku === entry?.originSku &&
            item?.destinationSku === entry?.destinationSku
        )
      );

      if (allSelected) {
        // Deselect only valid entries for this product
        setTransferOrderVariants((prevVariants) =>
          prevVariants.filter(
            (variant) =>
              !(
                variant.productTitle === product.productTitle &&
                validEntries.some(
                  (entry) =>
                    entry.size === variant.size &&
                    entry.color?.code === variant.color?.code &&
                    entry.originSku === variant.originSku &&
                    entry.destinationSku === variant.destinationSku
                )
              )
          )
        );

        return prevSelectedProducts.filter(
          (item) =>
            !(
              item.productTitle === product.productTitle &&
              validEntries.some(
                (entry) =>
                  entry.size === item.size &&
                  entry.color?.code === item.color &&
                  entry.originSku === item.originSku &&
                  entry.destinationSku === item.destinationSku
              )
            )
        );
      } else {
        // Select only valid entries
        const newSelections = validEntries.map((entry) => ({
          productTitle: product?.productTitle,
          imageUrl: product?.imageUrl,
          size: entry?.size,
          color: entry?.color?.code,
          name: entry?.color?.name,
          originSku: entry?.originSku,
          destinationSku: entry?.destinationSku,
        }));

        setTransferOrderVariants((prevVariants) => [
          ...prevVariants.filter((variant) => variant.productTitle !== product.productTitle),
          ...validEntries.map((entry) => ({
            productTitle: product?.productTitle,
            size: entry?.size,
            color: { code: entry?.color?.code, name: entry?.color?.name },
            originSku: entry?.originSku,
            destinationSku: entry?.destinationSku,
            quantity: 0,
            cost: 0,
            tax: 0,
          })),
        ]);

        return [
          ...prevSelectedProducts.filter((item) => item.productTitle !== product.productTitle),
          ...newSelections,
        ];
      }
    });
  };

  // Function to remove a selected product
  const removeSelectedProduct = (product, size, color) => {

    setSelectedProducts((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.filter(
        (item) => !(
          item.productTitle === product.productTitle &&
          item.size === size &&
          item.color === color
        )
      );
      return updatedSelectedProducts;
    });

    setTransferOrderVariants((prevVariants) => {
      const updatedVariants = prevVariants.filter((variant) => {
        const titleMatches = variant.productTitle === product.productTitle;
        const sizeMatches = variant.size === size;
        const colorMatches = variant.color?.code === color;

        return !(titleMatches && sizeMatches && colorMatches);
      });
      return updatedVariants;
    });
  };

  // Update filtered products whenever productList or searchQuery changes
  useEffect(() => {
    const totalSku = calculateSkuBySizeAndColorAndLocation(productList, selectedOrigin, selectedDestination);

    const filtered = totalSku.filter((product) => {
      // Check if productTitle matches the search query
      const titleMatches = product.productTitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Check if sizes, colors, originSku, or destinationSku match the search query
      const sizeOrColorMatches = product.skuBySizeAndColor.some((entry) => {
        // Check if entry.size matches the search query
        const sizeMatches = entry.size.toString().toLowerCase().includes(searchQuery.toLowerCase());

        // Check if entry.color name matches the search query
        const colorNameMatches = entry.color && typeof entry.color.name === 'string' && entry.color.name.toLowerCase().includes(searchQuery.toLowerCase());

        return sizeMatches || colorNameMatches;
      });

      // Check if originSku matches the search query
      const originSkuMatches = product.skuBySizeAndColor.some((entry) => {
        return entry.originSku.toString().includes(searchQuery);
      });

      // Check if destinationSku matches the search query
      const destinationSkuMatches = product.skuBySizeAndColor.some((entry) => {
        return entry.destinationSku.toString().includes(searchQuery);
      });

      // Return true if title, size/color, originSku, or destinationSku matches the search query
      return titleMatches || sizeOrColorMatches || originSkuMatches || destinationSkuMatches;
    });

    setFilteredProducts(filtered);
  }, [productList, searchQuery, selectedOrigin, selectedDestination]);

  const getNextOrderNumber = () => {
    if (!transferOrderList || transferOrderList.length === 0) {
      return 1; // Start from 1 if no orders exist
    }

    // Extract existing order numbers and find the maximum
    const existingOrderNumbers = transferOrderList?.map(order =>
      parseInt(order.transferOrderNumber.replace('T', '')) // Adjusted to use purchaseOrderNumber
    );
    return Math.max(...existingOrderNumbers) + 1; // Increment the maximum order number
  };

  const onSubmit = async (data) => {

    const { shippingCarrier, trackingNumber, referenceNumber, supplierNote, estimatedArrival } = data;

    // Check if expiryDate is selected
    if (!estimatedArrival) {
      setDateError(true);
      return;  // Do not show toast here, just prevent submission
    }

    // If date is valid, reset the date error
    setDateError(false);

    const formattedEstimatedArrival = formatDate(estimatedArrival);

    if (selectedProducts.length === 0) {
      toast.error("Please add product.");
      return;
    }

    // Ensure required fields are filled
    for (const variant of transferOrderVariants) {
      if (!variant.quantity || variant.quantity <= 0) {
        toast.error("Quantity must be greater than 0 for all products.");
        return; // Prevent form submission
      }
    }

    const nextOrderNumber = getNextOrderNumber();
    const transferOrderNumber = `T${nextOrderNumber.toString().padStart(3, '0')}`; // Create the new purchase order number

    const transferOrderData = {
      origin: selectedOrigin,
      destination: selectedDestination,
      transferOrderVariants: transferOrderVariants?.map(variant => ({
        productTitle: variant.productTitle,
        quantity: parseFloat(variant.quantity),
        size: variant?.size,
        colorCode: variant.color?.code,  // Include the color code
        colorName: variant.color?.name,   // Include the color name
        cost: variant.cost || 0,
        tax: variant.tax || 0,
      })),
      transferOrderNumber,
      status: "pending",
      selectedProducts,
      estimatedArrival: formattedEstimatedArrival,
      referenceNumber: referenceNumber || "",
      supplierNote: supplierNote || "",
      shippingCarrier: shippingCarrier || "",
      trackingNumber: trackingNumber || ""
    };

    try {
      const response = await axiosSecure.post('/addTransferOrder', transferOrderData);
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
                    Transfer order added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Transfer order has been added successfully!
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
        router.push("/product-hub/transfers");
      }
    } catch (error) {
      toast.error('Failed to add purchase order. Please try again!');
    }

  };

  if (isProductPending || isTransferOrderPending || isPurchaseOrderPending) {
    return <Loading />
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] px-6'>

      <div className='max-w-screen-xl mx-auto pt-3 md:pt-6'>
        <div className='flex items-center justify-between w-full'>
          <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>Create transfer</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/transfers"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-xl mx-auto py-6 flex flex-col gap-4'>

          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <OriginSelect register={register} selectedDestination={selectedDestination} errors={errors} selectedOrigin={selectedOrigin} setSelectedOrigin={setSelectedOrigin} />
            <DestinationSelect register={register} selectedOrigin={selectedOrigin} errors={errors} selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination} />
          </div>

          <div className='bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
            <h1 className='font-bold text-lg'>Add products</h1>
            <div className='w-full pt-2'>
              <li className="flex items-center relative group border-2 rounded-lg">
                <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white text-[#0d0c22] transition duration-300 ease-in-out focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:bg-white  text-[12px] md:text-base"
                />
              </li>
            </div>

            {selectedProducts?.length > 0 &&
              <div className="max-w-screen-2xl mx-auto overflow-x-auto custom-scrollbar relative pt-4">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-[1] bg-white">
                    <tr>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b">
                        Products
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b  text-center">
                        Available at origin
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b  text-center">
                        Available at Destination
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b text-right">
                        Quantity
                      </th>
                      <th className="text-[10px] md:text-xs font-bold p-2 xl:p-3 text-neutral-950 border-b">

                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts?.map((product, index) => {
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="text-sm p-3 text-neutral-500 text-center cursor-pointer flex flex-col lg:flex-row items-center gap-3">
                            <div>
                              <Image className='h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5' src={product?.imageUrl} alt={product?.productTitle} height={600} width={600} />
                            </div>
                            <div className='flex flex-col items-start justify-start gap-1'>
                              <p className='font-bold text-blue-700 text-start'>{product?.productTitle}</p>
                              <p className='font-medium'>{product?.size}</p>
                              <span className='flex items-center gap-2'>
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-sm p-3 text-neutral-500 font-semibold text-center">
                            {product?.originSku}
                          </td>
                          <td className="text-sm p-3 text-neutral-500 font-semibold text-center">
                            {product?.destinationSku}
                          </td>
                          <td className="text-sm p-3 text-neutral-500 font-semibold">
                            <div className='flex flex-col justify-center items-end'>
                              <input
                                id={`quantity-${index}`}
                                {...register(`quantity-${index}`, { required: true })}
                                value={transferOrderVariants[index]?.quantity || ''}
                                onChange={(e) => handleVariantChange(index, 'quantity', e.target.value, product?.productTitle, product?.size, product?.name, product.color)}
                                className="custom-number-input p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                                type="number"
                                min="0" // Prevents negative values in the input
                              />
                              {errors[`quantity-${index}`] && (
                                <p className="text-red-600 text-left">Quantity is required.</p>
                              )}
                            </div>
                          </td>
                          <td className="text-sm p-3 text-neutral-500 font-semibold">
                            <button
                              type="button"  // Set type to "button" to prevent form submission
                              onClick={() => removeSelectedProduct(product, product.size, product.color)}
                              className="hover:text-red-700 text-gray-700"
                              aria-label="Remove product"
                            >
                              <RxCross2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
            {selectedProducts?.length > 0 && <p className='px-4 pt-4 text-neutral-500 font-medium'>{selectedProducts?.length} variants on transfer order</p>}

          </div>

          <div className='flex flex-col lg:flex-row w-full justify-between items-start gap-6'>

            <div className='w-full flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
              <h1 className='font-semibold'>Shipment Details</h1>

              <div className='flex-1'>
                <label htmlFor='estimatedArrival' className='flex justify-start font-medium text-neutral-800 pb-2'>Estimated Arrival</label>
                <DatePicker
                  id='estimatedArrival'
                  placeholder="Select date"
                  aria-label="Select expiry date"
                  onChange={(date) => {
                    handleShowDateError(date);
                    if (date instanceof Date && !isNaN(date)) {
                      setValue('estimatedArrival', date.toISOString().split('T')[0]); // Ensure it's a valid Date object and format it as YYYY-MM-DD
                    } else {
                      setValue('estimatedArrival', date); // If DatePicker returns something else, handle it here
                    }
                  }}
                  className="w-full outline-none focus:border-[#D2016E] transition-colors duration-1000 rounded-md"
                />
                {dateError && (
                  <p className="text-red-600 text-left">Please select estimated arrival date.</p>
                )}
              </div>
              <div>
                <label htmlFor='shippingCarrier' className='flex justify-start font-medium text-neutral-500 pb-2'>Shipping carrier</label>
                <input
                  id={`shippingCarrier`}
                  {...register(`shippingCarrier`)}
                  className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor='trackingNumber' className='flex justify-start font-medium text-neutral-500 pb-2'>Tracking Number</label>
                <input
                  id={`trackingNumber`}
                  {...register(`trackingNumber`)}
                  className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md mb-[14px]"
                  type="text"
                />
              </div>

            </div>

            <div className='w-full flex flex-col justify-between gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg'>
              <h1 className='font-semibold'>Additional Details</h1>
              <div>
                <label htmlFor='referenceNumber' className='flex justify-start font-medium text-neutral-500 pb-2'>Reference Number</label>
                <input
                  id={`referenceNumber`}
                  {...register(`referenceNumber`)}
                  className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor='supplierNote' className='flex justify-start font-medium text-neutral-500 pb-2'>Note to supplier</label>
                <textarea
                  id="supplierNote"
                  {...register("supplierNote")}
                  className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
                  rows={5} // Set the number of rows for height adjustment
                />

              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className='flex justify-end items-center'>
            <Button
              type='submit'
              className={`mt-4 mb-8 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer font-bold`}
            >
              Create transfer
            </Button>
          </div>
        </div>

      </form>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col">
                <p>All products</p>
                <div className='w-full pt-1'>
                  <li className="flex items-center relative group border-1.5 rounded-lg">
                    <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                      <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                      </g>
                    </svg>
                    <input
                      type="search"
                      placeholder="Search products"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                      className="w-full h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white text-[#0d0c22] transition duration-300 ease-in-out focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:bg-white  text-[12px] md:text-base"
                    />
                  </li>
                </div>
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-[1] bg-white">
                    <tr>
                      <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b">Products</th>
                      <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Available at Origin</th>
                      <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Available at Destination</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-gray-500 py-32">
                          <h1 className="text-xl font-semibold text-neutral-800">No Products Available!</h1>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="text-xs p-3 cursor-pointer flex items-center gap-3">
                              <Checkbox
                                isSelected={
                                  selectedProducts.some((p) => p.productTitle === product.productTitle) &&
                                  product.skuBySizeAndColor.every((entry) =>
                                    selectedProducts.some(
                                      (p) => p.productTitle === product.productTitle &&
                                        p.size === entry.size &&
                                        p.color === entry.color?.code && // Ensure color is correctly accessed 
                                        p.name === entry.color?.name &&
                                        p.originSku === entry.originSku // Include originSku in selection
                                    )
                                  )
                                }
                                onValueChange={() => toggleAllSizesAndColorsForProduct(product)}
                              />

                              <div>
                                <Image
                                  className="h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5"
                                  src={product.imageUrl}
                                  alt={product?.productTitle}
                                  height={600}
                                  width={600}
                                />
                              </div>
                              <div className="flex flex-col">
                                <p className="font-bold text-sm">{product.productTitle}</p>
                              </div>
                            </td>
                            <td colSpan="2"></td>
                          </tr>

                          {/* Show sizes and colors */}
                          {product?.skuBySizeAndColor?.map((entry) => (
                            <tr key={`${index}-${entry.size}-${entry.color.code}`} className="hover:bg-gray-50 transition-colors">
                              <td className="pl-12 text-xs p-3 text-gray-600 flex items-center">
                                <Checkbox
                                  key={`${product.productTitle}-${entry.size}-${entry.color?.code}`} // Unique key for each checkbox
                                  isSelected={selectedProducts.some(
                                    (p) => p.productTitle === product.productTitle &&
                                      p.size === entry.size &&
                                      p.color === entry.color?.code && // Ensure color is correctly accessed
                                      p.name === entry.color?.name &&
                                      p.originSku === entry.originSku // Include originSku in selection
                                  )}
                                  onValueChange={() => toggleProductSizeColorSelection(product, entry.size, entry.color?.code, entry.color?.name, entry?.originSku, entry?.destinationSku)}
                                  isDisabled={entry.originSku === 0}
                                />
                                <span className="font-semibold ml-2">
                                  {entry.size}
                                  <span className='flex items-center gap-2'>
                                    {entry.color.name}
                                  </span>
                                </span>
                              </td>
                              <td className="text-center">{entry.originSku}</td>
                              <td className="text-center">{entry.destinationSku}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </ModalBody>
              <ModalFooter className='flex justify-between items-center'>
                <div>
                  {selectedProducts?.length > 0 && <p className='border px-4 rounded-lg shadow py-1'>{selectedProducts?.length} variants selected</p>}
                </div>
                <div className='flex gap-4 items-center'>
                  <Button size='sm' variant="bordered" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button size='sm' className='bg-neutral-700 text-white font-bold' onPress={onClose}>
                    Done
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default CreateTransfer;