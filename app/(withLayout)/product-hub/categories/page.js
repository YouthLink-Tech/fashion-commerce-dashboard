"use client";
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useCategories from '@/app/hooks/useCategories';
import Loading from '@/app/components/shared/Loading/Loading';
import { RiDeleteBinLine } from 'react-icons/ri';
import { AiOutlineEdit } from "react-icons/ai";
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import { FaPlus, FaStar } from "react-icons/fa6";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { useAuth } from '@/app/contexts/auth';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const currentModule = "Product Hub";

const CategoriesOverview = () => {
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [categoryList, isCategoryPending, refetch] = useCategories();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFeaturedCategories, setSelectedFeaturedCategories] = useState([]);
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  useEffect(() => {
    if (isOpen) {
      // Populate selected featured categories based on `isFeatured`
      const initiallySelected = categoryList
        ?.filter(category => category.isFeatured)
        ?.map(category => category.label);
      setSelectedFeaturedCategories(initiallySelected || []);
    }
  }, [isOpen, categoryList]);

  const handleDelete = async (categoryId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/deleteCategory/${categoryId}`);
          if (res?.data?.deletedCount) {
            refetch(); // Call your refetch function to refresh data
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
                        Category Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Category has been deleted successfully!
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
        } catch (error) {
          toast.error('Failed to delete category. Please try again.');
        }
      }
    });
  };

  const toggleSubCategoriesVisibility = (categoryId) => {
    setExpandedCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const handleSelectFeaturedCategory = () => {
    onOpen();
  };

  // Function to handle featured category selection
  const handleFeaturedCategorySelection = (categoryLabel) => {
    if (selectedFeaturedCategories.includes(categoryLabel)) {
      // Remove the label if it's already in the selected list
      setSelectedFeaturedCategories(prev => prev.filter(label => label !== categoryLabel));
    } else {
      // Only allow selecting up to 4 categories
      if (selectedFeaturedCategories.length < 5) {
        setSelectedFeaturedCategories(prev => [...prev, categoryLabel]);
      } else {
        toast.error("You can only select up to 5 categories.");
      }
    }
  };

  const handleFeaturedCategorySave = async () => {

    if (selectedFeaturedCategories.length !== 5) {
      toast.error("You must select exactly 5 featured categories.");
      return;
    };

    try {

      // Prepare the list of categories to update
      const categoriesToUpdate = categoryList?.map(category => {
        return {
          label: category.label,
          isFeatured: selectedFeaturedCategories.includes(category.label) // Check if category is selected
        };
      });

      const response = await axiosSecure.patch("/updateFeaturedCategories", categoriesToUpdate);

      if (response?.data?.modifiedCount > 0) {
        toast.success("Featured category selected successfully!");
        onClose(); // Close the modal
        setSelectedFeaturedCategories([]); // Reset selected categories
        refetch();
      } else {
        toast.error("No changes detected.");
      }
    } catch (error) {
      console.error("Error saving featured categories:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (isCategoryPending || isUserLoading) {
    return <Loading />
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
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
        className='absolute inset-0 z-0 top-2 md:top-4 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[30%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='sticky top-0 z-10 bg-gray-50 flex items-center flex-wrap gap-4 justify-between max-w-screen-2xl mx-auto px-6 pt-6'>
        <h1 className='font-semibold text-center text-[16px] lg:text-3xl text-neutral-700'>CATEGORY MANAGEMENT</h1>

        <div className='flex items-center gap-3 justify-center'>

          {isOwner &&
            <button onClick={handleSelectFeaturedCategory} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[12px] lg:text-[14px] text-neutral-700">
              <FaStar size={17} className='text-neutral-700' /> Select Featured Category
            </button>
          }

          {isAuthorized &&
            <button onClick={() => router.push('/product-hub/categories/add-category')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[12px] lg:text-[14px] text-neutral-700">
              <FaPlus size={15} className='text-neutral-700' /> Add
            </button>
          }

        </div>

      </div>

      <div className='max-w-screen-2xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 px-6 relative'>
        {categoryList?.map(category => (
          <div key={category?._id} className='category-item border p-4 rounded-md bg-white'>
            <div className='flex justify-between items-center'>
              <h4 className='font-bold text-lg'>{category?.label}</h4>
              <div className='flex justify-end items-center gap-2'>

                {/* Edit Button */}
                {isAuthorized &&
                  <button onClick={() => router.push(`/product-hub/categories/${category._id}`)}>
                    <span className='flex items-center gap-1.5 rounded-md bg-neutral-100 p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-neutral-200 max-md:[&_p]:hidden max-md:[&_svg]:size-4'><AiOutlineEdit size={16} /> Edit </span>
                  </button>
                }

                {/* Delete Button */}
                {isOwner &&
                  <button onClick={() => handleDelete(category?._id)}>
                    <span className='flex items-center gap-1.5 rounded-md bg-red-50 p-1.5 font-semibold text-neutral-600 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-red-100 hover:text-neutral-700 sm:p-2.5 [&_p]:text-xs max-md:[&_p]:hidden max-md:[&_svg]:size-4 text-xs'> <RiDeleteBinLine size={16} />Delete </span>
                  </button>
                }

              </div>
            </div>
            <div className='mt-4 flex items-center justify-between'>
              <p><strong>Sizes:</strong> {category.sizes.join(', ')}</p>
              {category?.isFeatured && <span className="text-green-500 text-2xl"><FaStar /></span>}
            </div>
            <div className='mt-2'>
              <strong>Sub-Categories: </strong>
              {category.subCategories.length > 4
                ? (expandedCategory === category._id
                  ? category.subCategories.map(sub => sub.label).join(', ')
                  : category.subCategories.slice(0, 4).map(sub => sub.label).join(', ') + '...')
                : category.subCategories.map(sub => sub.label).join(', ')}

              {category.subCategories.length > 4 && (
                <button
                  onClick={() => toggleSubCategoriesVisibility(category._id)}
                  className="pl-2 text-blue-600 underline"
                >
                  {expandedCategory === category._id ? 'See Less' : 'See More'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal className='mx-4 lg:mx-0' isOpen={isOpen} onOpenChange={onClose} size='xl'>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gray-200 px-8">
            Select Featured Categories (Only 5 can be selected)
          </ModalHeader>
          <ModalBody className="modal-body-scroll">
            <div className="grid grid-cols-2 gap-4">
              {categoryList?.map(category => (
                <div key={category?._id} className="flex items-center gap-2">
                  <Checkbox
                    key={category._id}
                    isSelected={selectedFeaturedCategories.includes(category.label)}
                    onChange={() => handleFeaturedCategorySelection(category.label)}
                  />
                  <span>{category?.label}</span>
                </div>
              ))}
            </div>

          </ModalBody>
          <ModalFooter className='flex items-center justify-end border'>
            <Button onPress={onClose} color="danger" variant='light' size='sm'>
              Close
            </Button>
            <Button onPress={handleFeaturedCategorySave} color="primary" size='sm'>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div >
  );
};

export default CategoriesOverview;