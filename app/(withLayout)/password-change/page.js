"use client";
import React, { useEffect, useState } from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
// import arrivals2 from "/public/card-images/arrivals2.svg";
import { MdOutlineFileUpload } from 'react-icons/md';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import { RxCheck, RxCross1, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useSession } from 'next-auth/react';
import Loading from '@/app/components/shared/Loading/Loading';

const PasswordChangePage = () => {

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const axiosPublic = useAxiosPublic();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  // Inside your component
  useEffect(() => {
    // Check if password and confirm password match
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(null); // Clear error if they match
    }
  }, [newPassword, confirmPassword]); // This will run whenever password or confirmPassword changes

  const onSubmit = async () => {

    setError(null);
    if (status === "unauthenticated") return setError("Please log in first")

    const passwordData = {
      email: session?.user?.email,
      currentPassword,
      newPassword
    };

    try {
      const response = await axiosPublic.put('/change-password', passwordData);
      if (response.data.success) {
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
                    Password changed!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your password changed successfully!
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
        reset();

      } else {
        setError('No changes detected. Your password remains the same.');
      }
    } catch (error) {
      if (error.response) {
        // Display specific error message from backend
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  if (status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
      />

      {/* <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      /> */}

      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='max-w-screen-sm mx-auto pt-28 lg:pt-56 px-6 relative'>
        {/* Heading */}
        <h1 className="text-4xl font-semibold sm:max-xl:text-center">
          Password & Security
        </h1>

        <p className={`${error ? "mb-5" : "mb-10"} mt-2 sm:max-xl:text-center`}>
          Change your password
        </p>

        {error && (
          <div className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-5">
            <RxCross1 className="text-red-700 w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-sm mx-auto px-6 flex flex-col gap-4'>

          {/* Current Password Input */}
          <div className="w-full space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <label htmlFor="currentPassword">Current Password</label>
            </div>
            <div className="relative">
              <input
                id="currentPassword"
                type={isCurrentPasswordVisible ? "text" : "password"}
                placeholder="Current Password"
                {...register("currentPassword", {
                  required: !currentPassword ? "Current Password is required." : false,
                  minLength: { value: 8, message: "Current Password must be at least 8 characters." },
                  onChange: (e) => setCurrentPassword(e.target.value), // Sync manual typing
                })}
                className={`h-11 w-full rounded-lg border-2 px-3 text-xs text-neutral-700 outline-none md:text-[13px] border-gray-300 focus:border-[#F4D3BA] focus:bg-white`}
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
              >
                {isCurrentPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
          </div>

          {/* New Password */}
          <div className="w-full space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <label htmlFor="newPassword">New Password</label>
            </div>
            <div className="relative">
              <input
                id="newPassword"
                type={isNewPasswordVisible ? "text" : "password"}
                placeholder="New Password Min : 8 Chars"
                {...register("newPassword", {
                  required: !newPassword ? "New Password is required." : false,
                  minLength: { value: 8, message: "New Password must be at least 8 characters." },
                  onChange: (e) => setNewPassword(e.target.value), // Sync manual typing
                })}
                className={`h-11 w-full rounded-lg border-2 px-3 text-xs text-neutral-700 outline-none md:text-[13px] border-gray-300 focus:border-[#F4D3BA] focus:bg-white`}
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
              >
                {isNewPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="w-full space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <label htmlFor="confirmPassword">Confirm password</label>
            </div>
            <div className="relative">
              <input
                id="confirmPassword"
                type={isConfirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: !confirmPassword ? "Confirm Password is required." : false,
                  minLength: { value: 8, message: "Confirm Password must be at least 8 characters." },
                  validate: (value) => value === newPassword || "Passwords do not match.", // Real-time password match validation
                  onChange: (e) => setConfirmPassword(e.target.value), // Sync manual typing
                })}
                className={`h-11 w-full rounded-lg border-2 px-3 text-xs text-neutral-700 outline-none md:text-[13px] border-gray-300 focus:border-[#F4D3BA] focus:bg-white`}
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              >
                {isConfirmPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>
            {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>} {/* Display custom error */}

          </div>

          {/* Update Button */}
          <div className='flex justify-end items-center'>
            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700 mt-4 mb-8`}>
              {isSubmitting ? 'Updating...' : 'Update'} <MdOutlineFileUpload size={20} />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default PasswordChangePage;