"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import { useAuth } from '@/app/contexts/auth';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import useShippingZones from '@/app/hooks/useShippingZones';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaArrowLeft } from 'react-icons/fa6';
import { RiDeleteBinLine } from 'react-icons/ri';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';

const currentModule = "Supply Chain";

const ExistingZones = () => {

  const axiosPublic = useAxiosPublic();
  const [shippingList, isShippingPending, refetch] = useShippingZones();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inside dhaka');
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  const dhakaSuburbs = ["Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi", "Gazipur", "Narayanganj"];

  // Filter data based on the active tab
  const filteredShippingList = shippingList?.filter((zone) => {
    if (activeTab === "inside dhaka") {
      return zone?.selectedCity?.includes("Dhaka");
    }
    if (activeTab === "dhaka suburbs") {
      return zone?.selectedCity?.some((city) => dhakaSuburbs.includes(city));
    }
    if (activeTab === "outside dhaka") {
      return !zone?.selectedCity?.includes("Dhaka") &&
        !zone?.selectedCity?.some((city) => dhakaSuburbs.includes(city));
    }
    return false;
  });

  // Ensure the code runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTabForShippingManagementPage');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTabForShippingManagementPage', activeTab);
    }
  }, [activeTab]);

  const handleDelete = async (zoneId) => {
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
          const res = await axiosPublic.delete(`/deleteShippingZone/${zoneId}`);
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
                        Shipment Removed!
                      </p>
                      <p className="mt-1 text-base text-gray-500">
                        Shipment Handler deleted successfully!
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
          toast.error('Failed to delete shipping zone. Please try again.');
        }
      }
    });
  };

  if (isShippingPending || isUserLoading) {
    return <Loading />
  }

  return (
    <div className='px-6 bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='py-4 w-full flex justify-between max-w-screen-2xl mx-auto'>

        <h3 className='text-start font-medium md:font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700 w-full'>SHIPPING MANAGEMENT</h3>

        {
          isAuthorized &&
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/supply-chain/zone"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        }

      </div>

      <div className='flex flex-wrap items-center gap-3 bg-gray-50 pt-2 max-w-screen-2xl mx-auto'>
        <button
          className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'inside dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'inside dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
          onClick={() => setActiveTab('inside dhaka')}
        >
          Inside Dhaka
        </button>

        <button
          className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'dhaka suburbs' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'dhaka suburbs' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
          onClick={() => setActiveTab('dhaka suburbs')}
        >
          Dhaka Suburbs
        </button>

        <button
          className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'outside dhaka' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'outside dhaka' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
          onClick={() => setActiveTab('outside dhaka')}
        >
          Outside Dhaka
        </button>
      </div>

      <div className="pt-2 max-w-screen-2xl mx-auto">

        <p className="pt-1 pb-4 text-neutral-800 font-semibold">
          {activeTab === "inside dhaka"
            ? "Only Dhaka"
            : activeTab === "dhaka suburbs"
              ? "Savar, Nabinagar, Ashulia, Keraniganj, Tongi, Gazipur, Narayanganj"
              : "Nationwide Areas Only without Dhaka"}
        </p>

        <div className="custom-max-h-orders overflow-x-auto modal-body-scroll mt-3 drop-shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Shipping Zone
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Shipping Handlers
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Shipping Charge
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Shipping Hour
                </th>
                {isAuthorized && <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Actions
                </th>}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShippingList?.map((zone, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                    {zone?.shippingZone}
                  </td>
                  <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                    {zone?.selectedShipmentHandler?.shipmentHandlerName}
                  </td>
                  <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                    {zone?.selectedShipmentHandler?.deliveryType.map((type, idx) => (
                      <div key={idx}>
                        {type}: ৳ {zone?.shippingCharges[type]}
                      </div>
                    ))}
                  </td>
                  <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                    {zone?.selectedShipmentHandler?.deliveryType.map((type, idx) => (
                      <div key={idx}>
                        {type}: {zone?.shippingDurations[type]} {type === "EXPRESS" ? "hours" : "days"}
                      </div>
                    ))}
                  </td>
                  {isAuthorized && <td className="p-3">
                    <div className="flex gap-2 items-center">
                      <div className='flex justify-end items-center gap-2'>

                        {/* Edit Button */}
                        <button onClick={() => router.push(`/supply-chain/zone/${zone?._id}`)}>
                          <span className='flex items-center gap-1.5 rounded-md bg-neutral-100 p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-neutral-200 max-md:[&_p]:hidden max-md:[&_svg]:size-4'><AiOutlineEdit size={16} /> Edit </span>
                        </button>

                        {/* Delete Button */}
                        {isOwner && <button onClick={() => handleDelete(zone?._id)}>
                          <span className='flex items-center gap-1.5 rounded-md bg-red-50 p-1.5 font-semibold text-neutral-600 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-red-100 hover:text-neutral-700 sm:p-2.5 [&_p]:text-xs max-md:[&_p]:hidden max-md:[&_svg]:size-4 text-xs'> <RiDeleteBinLine size={16} />Delete </span>
                        </button>}

                      </div>
                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default ExistingZones;