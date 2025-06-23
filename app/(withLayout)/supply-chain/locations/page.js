"use client";
import CustomSwitch from '@/app/components/shared/switch/CustomSwitch';
import Loading from '@/app/components/shared/Loading/Loading';
import useLocations from '@/app/hooks/useLocations';
import { Checkbox } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBinLine } from 'react-icons/ri';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { useAuth } from '@/app/contexts/auth';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const currentModule = "Supply Chain";

const LocationsPage = () => {

  const [locationList, isLocationPending, refetch] = useLocations();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  const handleDeleteLocation = async (locationId) => {
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
          const res = await axiosSecure.delete(`/deleteLocation/${locationId}`);
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
                        Location Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Location has been deleted successfully!
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
          toast.error('Failed to delete Location. Please try again.');
        }
      }
    });
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      // Find the discount that needs to be updated
      const findLocation = locationList?.find(location => location?._id === id);
      if (!findLocation) {
        toast.error('Location not found.');
        return;
      }

      // Exclude the _id field from the discount data
      const { _id, ...rest } = findLocation;
      const locationData = { ...rest, status: !currentStatus };

      // Send the update request
      const res = await axiosSecure.put(`/updateLocation/${id}`, locationData);
      if (res.data.modifiedCount > 0) {
        await refetch(); // Refetch the promo list to get the updated data
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
                    Location Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Location updated successfully!
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
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing status:', error);
      toast.error('Failed to update status. Please try again!');
    }
  };

  if (isLocationPending || isUserLoading) {
    return <Loading />
  }

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-36 xl:-top-[138px]'
      />
      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center top-10 xl:-top-28 w-full bg-no-repeat'
      />
      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-10 xl:-top-2 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='flex justify-between items-center px-6 py-3 max-w-screen-2xl mx-auto relative'>
        <h1 className='py-2 md:py-3 font-semibold text-center text-lg md:text-xl lg:text-3xl text-neutral-700 sticky top-0 z-[10] bg-gray-50'>LOCATION MANAGEMENT</h1>
        {isAuthorized && <button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700">
          <Link className='flex items-center gap-2' href={"/supply-chain/locations/add-location"}> <FaPlus size={14} /> <span>Add</span></Link>
        </button>}
      </div>

      <div className="px-6 max-w-screen-2xl mx-auto custom-max-h-orders overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-[1] bg-white">
            <tr>
              <th className="text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">Location Name</th>
              <th className="text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">Location Address</th>
              {isAuthorized && <th className="text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">Actions</th>}
              {isOwner && <th className="text-xs p-2 xl:p-3 text-gray-700 border-b border-gray-300">Status</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">

            {locationList?.sort((a, b) => b.isPrimaryLocation - a.isPrimaryLocation)?.map((location, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">

                {/* Conditional color for Location Name */}
                <td className={`text-xs p-3 ${location?.isPrimaryLocation ? 'font-bold text-green-500 flex items-center justify-start mt-2' : 'text-gray-700'}`}>
                  {/* Checkbox for isPrimaryLocation */}
                  {location?.isPrimaryLocation && (
                    <p>
                      <Checkbox
                        isSelected={true}
                        color="success"
                      />
                    </p>
                  )}
                  {location?.locationName}
                </td>

                <td className={`text-xs p-3 ${location?.isPrimaryLocation ? 'font-bold text-green-500' : 'text-gray-700'}`}>
                  {location?.locationAddress},{location?.cityName},{location?.postalCode}
                </td>

                {isAuthorized && <td className="p-3">
                  <div className="flex gap-2 items-center">

                    <div className='flex justify-end items-center gap-2'>

                      {/* Edit Button */}
                      <button onClick={() => router.push(`/supply-chain/locations/${location?._id}`)}>
                        <span className='flex items-center gap-1.5 rounded-md bg-neutral-100 p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-neutral-200 max-md:[&_p]:hidden max-md:[&_svg]:size-4'><AiOutlineEdit size={16} /> Edit </span>
                      </button>

                      {/* Delete Button */}
                      {isOwner && <button onClick={() => handleDeleteLocation(location?._id)}>
                        <span className='flex items-center gap-1.5 rounded-md bg-red-50 p-1.5 font-semibold text-neutral-600 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-red-100 hover:text-neutral-700 sm:p-2.5 [&_p]:text-xs max-md:[&_p]:hidden max-md:[&_svg]:size-4 text-xs'> <RiDeleteBinLine size={16} />Delete </span>
                      </button>}

                    </div>
                  </div>
                </td>}

                {isOwner && <td key="status" className="text-xs p-3 text-gray-700">
                  <CustomSwitch
                    checked={location?.status}
                    onChange={() => handleStatusChange(location?._id, location?.status)}
                    size="md"
                    color="primary"
                  />
                </td>}

              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
};

export default LocationsPage;