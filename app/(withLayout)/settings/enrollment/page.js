"use client";
import React, { useMemo, useState } from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import { MdBlock } from "react-icons/md";
import { RxCheck, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import Loading from '@/app/components/shared/Loading/Loading';
import useExistingUsers from '@/app/hooks/useExistingUsers';
import { FaCheckCircle, FaExclamationCircle, FaRedo } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { AiOutlineEdit } from 'react-icons/ai';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import EnrollmentForm from '@/app/components/settings/enrollment/EnrollmentForm';
import EditCartDrawer from '@/app/components/settings/enrollment/cart/EditCartDrawer';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const EnrollmentPage = () => {

  const axiosSecure = useAxiosSecure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [existingUsers, isExistingUsersPending, refetch] = useExistingUsers();
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState(null);

  const handleResendInvitationMail = async (email, fullName, role) => {

    Swal.fire({
      title: "Resend Email Confirmation",
      text: "Are you sure you want to resend this email? The recipient will receive another email.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, resend it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {

          const resendInformation = {
            fullName,
            email,
            role,
          };

          const response = await axiosSecure.post('/invite', resendInformation);

          if (response.data.success) {
            // ✅ Show success toast if the invitation is successfully sent
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
                        {`Invitation resent to ${email}`}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {response?.data?.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
                  >
                    <RxCross2 />
                  </button>
                </div>
              </div>
            ), {
              position: "bottom-right",
              duration: 5000
            });

            refetch(); // Refresh the user list if necessary

          } else {

            // ✅ Show error toast if the invitation is not successfully sent
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
                        Failed to resend invitation to ${email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {response?.data?.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
                  >
                    <RxCross2 />
                  </button>
                </div>
              </div>
            ), {
              position: "bottom-right",
              duration: 5000
            });

          }
        } catch (error) {
          // ❌ Show error toast when something goes wrong
          toast.custom((t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
            >
              <div className="pl-6">
                <RxCross2 className="h-6 w-6 bg-red-500 text-white rounded-full" />
              </div>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-base font-bold text-gray-900">
                      Failed to resend invitation to ${email}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {error.response?.data?.message || error?.response?.data?.error}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-red-700 focus:outline-none text-2xl"
                >
                  <RxCross2 />
                </button>
              </div>
            </div>
          ), {
            position: "bottom-right",
            duration: 5000
          });
        }
      }
    });

  };

  const handleRemoveUser = async (userId) => {
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
          const res = await axiosSecure.delete(`/delete-existing-user/${userId}`);
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
                        User Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        User has been removed successfully!
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
          toast.error('Failed to delete this user. Please try again.');
        }
      }
    });
  };

  // Function to determine the status and render appropriate UI
  const getStatusTextAndIcon = (user) => {

    // get current date
    const currentTime = new Date();

    // If isSetupComplete is true
    if (user.isSetupComplete) {
      return {
        statusText: <p className='text-green-600'>Accepted</p>,
        icon: <FaCheckCircle color="green" />
      };
    }

    // If isSetupComplete is not there and expiresAt is not expired, show "Pending"
    if (!user.isSetupComplete && new Date(user.expiresAt) > currentTime) {
      return {
        statusText: <p className='text-amber-600'>Pending</p>,
        icon: <FaClock color="orange" />
      };
    }

    // If hashedToken and expiresAt is empty or expired
    if ((!user.hashedToken && !user.expiresAt) || new Date(user.expiresAt) < currentTime) {
      return {
        statusText: <p className='text-rose-600'>Expired</p>,
        icon: <FaExclamationCircle color="red" />,
        button: <button onClick={() => handleResendInvitationMail(user?.email, user?.fullName, user?.role)} className="flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 font-semibold text-neutral-600 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-rose-100 hover:text-neutral-700 sm:p-2.5 [&_p]:text-xs max-md:[&_p]:hidden max-md:[&_svg]:size-4 text-xs"><FaRedo /> Resend</button>
      };
    }

    // Default fallback for any other condition (shouldn't be hit under normal cases)
    return {
      statusText: "Unknown",
      icon: <FaExclamationCircle color="gray" />
    };
  };

  const handleEditClick = (userId) => {
    setIsGrantAccessOpen(true);
    setSelectedUserId(userId);
  };

  // Inside your component
  const mergedPermissions = useMemo(() => {
    const result = {};

    selectedUserPermissions?.forEach(({ role, modules }) => {
      if (!result[role]) {
        result[role] = {};
      }

      Object.entries(modules).forEach(([module, { access }]) => {
        if (!result[role][module]) {
          result[role][module] = { access };
        } else {
          result[role][module].access = result[role][module].access || access;
        }
      });
    });

    return result;
  }, [selectedUserPermissions]);

  if (isExistingUsersPending) return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative px-6 md:px-10'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[58px]'
      />

      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-16 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='flex justify-between items-center'>
        <h1 className="font-bold text-lg md:text-xl lg:text-2xl text-neutral-700 py-1 2xl:py-3">USER MANAGEMENT</h1>

        <EnrollmentForm refetch={refetch} />
      </div>

      <div className='relative'>

        <div className="custom-max-h custom-scrollbar overflow-x-auto modal-body-scroll mt-3 drop-shadow rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Serial Number
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Full Name
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Email
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  User Role
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Invitation Status
                </th>
                <th className="text-sm md:text-base p-2 xl:p-3 text-gray-700 border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {existingUsers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-80">
                    No users found.
                  </td>
                </tr>
              ) : (
                existingUsers?.map((user, index) => {
                  const { statusText, icon, button } = getStatusTextAndIcon(user);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="text-xs md:text-sm lg:pl-6 xl:pl-12 font-medium p-3 text-neutral-950">
                        {index + 1}
                      </td>
                      <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                        {user?.fullName || "--"}
                      </td>
                      <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                        {user?.email}
                      </td>
                      <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                        <button
                          onClick={() => {
                            setSelectedUserPermissions(user.permissions); // `user` should be the current row data
                            onOpen();
                          }}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                      <td className="text-xs md:text-sm font-medium p-3 text-neutral-950">
                        <div className='flex items-center gap-2'>
                          <span className='flex items-center gap-2'>{icon} {statusText}</span>
                          {button && <div>{button}</div>}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2 items-center">
                          <div className='flex justify-end items-center gap-2'>

                            {/* Edit Button */}
                            <button>
                              <span onClick={() => handleEditClick(user._id)} className='flex items-center gap-1.5 rounded-md bg-neutral-100 p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-neutral-200 max-md:[&_p]:hidden max-md:[&_svg]:size-4'><AiOutlineEdit size={16} /> Edit</span>
                            </button>

                            {/* Remove user Button */}
                            <button onClick={() => handleRemoveUser(user?._id)}>
                              <span className='flex items-center gap-1.5 rounded-md bg-red-50 p-1.5 font-semibold text-neutral-600 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-red-100 hover:text-neutral-700 sm:p-2.5 [&_p]:text-xs max-md:[&_p]:hidden max-md:[&_svg]:size-4 text-xs'> <MdBlock size={16} />Remove</span>
                            </button>

                          </div>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>

          </table>

        </div>

      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-gray-200">
                <h2 className="text-lg font-semibold px-2">User Roles by Module</h2>
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                <div className="space-y-4 max-h-80 overflow-y-auto p-1">
                  {Object.entries(mergedPermissions).map(([role, modules]) => (
                    <div
                      key={role}
                      className="border border-neutral-200 rounded-xl p-4 bg-white shadow hover:shadow-md duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-neutral-800">
                          Role: <span className="text-blue-600">{role}</span>
                        </h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                          {Object.entries(modules).filter(([, { access }]) => access).length} Modules
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Object.entries(modules).map(
                          ([module, { access }]) =>
                            access && (
                              <span
                                key={module}
                                className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium tracking-tight"
                              >
                                {module}
                              </span>
                            )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </ModalBody>
              <ModalFooter className='flex justify-end items-center border'>
                <div className='flex gap-4 items-center'>
                  <Button size='sm' color='danger' variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Grant access drawer */}
      <EditCartDrawer
        isGrantAccessOpen={isGrantAccessOpen}
        setIsGrantAccessOpen={setIsGrantAccessOpen}
        refetch={refetch}
        userId={selectedUserId}
      />

    </div>
  );
};

export default EnrollmentPage;