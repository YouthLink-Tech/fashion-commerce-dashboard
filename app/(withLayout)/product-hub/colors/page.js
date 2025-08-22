"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import useColors from '@/app/hooks/useColors';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';
import { useAuth } from '@/app/contexts/auth';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const currentModule = "Product Hub";

const ColorsPage = () => {

  const [colorList, isColorPending, refetchColors] = useColors();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  const handleDeleteColor = async (colorId) => {
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
          const res = await axiosSecure.delete(`/deleteColor/${colorId}`);
          if (res?.data?.deletedCount) {
            refetchColors(); // Call your refetch function to refresh data
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
                        Color Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Color has been deleted successfully!
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
          toast.error('Failed to delete color. Please try again.');
        }
      }
    });
  };

  if (isColorPending || isUserLoading) {
    return <Loading />
  }

  return (
    <div className='relative bg-gray-50'>

      <div className='sticky top-0 z-10 bg-gray-50 flex items-center justify-between p-6'>
        <h1 className='font-semibold text-center text-lg md:text-xl lg:text-3xl text-neutral-700'>COLOR MANAGEMENT</h1>

        {isAuthorized &&
          <button onClick={() => router.push('/product-hub/colors/add-color')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700">
            <FaPlus size={15} className='text-neutral-700' /> Add
          </button>
        }

      </div>

      <div className='w-full divide-y divide-gray-200 pt-2'>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-center justify-center w-full divide-y divide-gray-200'>
          {colorList?.map((color, index) => (
            <div key={index} className='flex items-center justify-center w-full md:px-2 lg:px-6 hover:bg-gray-100 transition-colors  cursor-pointer'>
              <p className='flex text-[15px] items-center gap-0.5 md:gap-1 p-2 w-full'>
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    backgroundColor: color?.color || '#fff',
                    marginRight: '8px',
                    borderRadius: '4px'
                  }}
                />
                {color?.value}
              </p>

              {isOwner &&
                <Button size="sm" className="text-xs" color="danger" variant="light" onPress={() => handleDeleteColor(color?._id)}><MdDeleteOutline className='text-red-800 hover:text-red-950 text-xl cursor-pointer' /></Button>
              }
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ColorsPage;