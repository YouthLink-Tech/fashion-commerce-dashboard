import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import useAxiosPublic from "@/app/hooks/useAxiosPublic";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { DatePicker } from "@nextui-org/react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RxCheck, RxCross2 } from "react-icons/rx";

const SetupForm = ({ email, isValidToken }) => {

  const { register: registerForSetup, control, handleSubmit, formState: { errors: errorsForSetup } } = useForm();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  // Inside your component
  useEffect(() => {
    // Check if password and confirm password match
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Password doesn't match.");
    } else {
      setConfirmPasswordError(null); // Clear error if they match
    }
  }, [password, confirmPassword]); // This will run whenever password or confirmPassword changes

  const calculateAge = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const onSubmit = async (data) => {

    if (!isValidToken) {
      toast.error("Invalid or expired token. Please try again.");
      return; // Prevent form submission if token is invalid
    }

    setLoading(true);

    const formattedDOB = `${data.dob.year}-${String(data.dob.month).padStart(2, "0")}-${String(data.dob.day).padStart(2, "0")}`;

    const setupInformation = {
      fullName: data.fullName,
      username: data?.username,
      dob: formattedDOB,
      password,
    };

    try {
      const response = await axiosPublic.patch(`/complete-setup/${email}`, setupInformation);

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
                    Account setup completed successfully!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You can now log in via OTP.
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

        router.push("/auth/restricted-access");

      } else {
        toast.error(response.data.message || "Setup failed!");
      }

    } catch (error) {
      toast.error(error?.response?.data?.error || "Something went wrong!");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen relative'>

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
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className="max-w-screen-sm mx-auto px-6 pt-24 relative">

        {/* Heading */}
        <h1 className="mb-10 mt-2 text-4xl font-semibold sm:max-xl:text-center">
          Setup your account
        </h1>

        {/* Email and password login section */}
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>

          <div className="w-full space-y-2 font-semibold bg-gray-50">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...registerForSetup("fullName", {
                required: {
                  value: true,
                  message: "Full name is required.",
                },
              })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]"
              required
            />
            {/* Email Error Message */}
            {errorsForSetup.fullName && (
              <p className="text-xs font-semibold text-red-500">
                {errorsForSetup.fullName?.message}
              </p>
            )}
          </div>

          <div className="w-full space-y-2 font-semibold bg-gray-50">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              {...registerForSetup("username", {
                pattern: {
                  value: /^(?!.*[_.]{2})[a-zA-Z0-9][a-zA-Z0-9_.]{1,18}[a-zA-Z0-9]$/,
                  message: "Username is not valid.",
                },
                required: {
                  value: true,
                  message: "Username is required.",
                },
              })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]"
              required
            />
            {/* Email Error Message */}
            {errorsForSetup.username && (
              <p className="text-xs font-semibold text-red-500">
                {errorsForSetup.username?.message}
              </p>
            )}
          </div>

          <div className="w-full space-y-2 font-semibold">
            <Controller
              name="dob"
              control={control}
              rules={{
                required: "Date of birth is required.",
                validate: (value) => {
                  const age = calculateAge(value);
                  if (age < 13) return "You must be at least 13 years old";
                  if (age > 120)
                    return "Age cannot be more than 120 years old";
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  id="dob"
                  labelPlacement="outside"
                  label="Date of Birth"
                  showMonthAndYearPickers
                  variant="bordered"
                  value={value}
                  onChange={onChange}
                  classNames={{
                    calendarContent:
                      "min-w-64 [&_td>span:hover]:bg-[#c2f3ba] [&_td>span:hover]:text-[#3f7136] [&_td>span[data-selected='true']]:bg-[#58944d] [&_td>span[data-selected='true']]:text-white [&_td>span[data-selected='true']:hover]:bg-[#58944d] [&_td>span[data-selected='true']:hover]:text-white",
                  }}
                  className="date-picker mt-1 gap-2 [&>div:focus-within:hover]:border-[#F4D3BA] [&>div:focus-within]:border-[#F4D3BA] [&>div:hover]:border-[#F4D3BA] [&>div]:bg-white/20 [&[data-disabled='true']>div]:opacity-50 [&[data-disabled='true']]:opacity-100 [&_[data-slot='input-field']]:text-xs [&_[data-slot='input-field']]:font-semibold md:[&_[data-slot='input-field']]:text-[13px] [&_[data-slot='label']]:text-neutral-500"
                />
              )}
            />
            {errorsForSetup.dob && (
              <p className="text-xs font-semibold text-red-500">
                {errorsForSetup.dob?.message}
              </p>
            )}
          </div>

          <div className="w-full space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <label htmlFor="password">Password</label>
            </div>

            <div className="relative">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                {...registerForSetup("password", {
                  required: !password ? "Password is required." : false,
                  minLength: { value: 8, message: "Password must be at least 8 characters." },
                  validate: (value) => {
                    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
                    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
                    if (!/\d/.test(value)) return "Password must contain at least one number.";
                    if (!/[@$!%*?&]/.test(value)) return "Password must contain at least one special character (@$!%*?&).";
                    return true;
                  },
                  onChange: (e) => setPassword(e.target.value),
                })}
                className={`h-11 w-full rounded-lg border-2 px-3 text-xs text-neutral-700 outline-none md:text-[13px] border-gray-300 focus:border-[#F4D3BA] focus:bg-white`}
                required
              />
              <div
                className="absolute right-3 top-1/2 w-4 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <AiOutlineEye className="text-neutral-700" />
                ) : (
                  <AiOutlineEyeInvisible className="text-neutral-400" />
                )}
              </div>
            </div>

            {/* Password Rules Checklist */}
            <div className="w-full rounded-md border px-4 py-3 text-xs space-y-2 bg-gray-50">
              {[
                { label: "At least 8 characters", isValid: password.length >= 8 },
                { label: "At least one uppercase letter", isValid: /[A-Z]/.test(password) },
                { label: "At least one lowercase letter", isValid: /[a-z]/.test(password) },
                { label: "At least one number", isValid: /\d/.test(password) },
                { label: "At least one special character (@$!%*?&)", isValid: /[@$!%*?&]/.test(password) },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {rule.isValid ? (
                    <AiOutlineCheck className="text-green-600" />
                  ) : (
                    <AiOutlineClose className="text-red-400" />
                  )}
                  <span className={`${rule.isValid ? "text-green-700" : "text-neutral-500"}`}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <label htmlFor="confirmPassword">Confirm password</label>
            </div>
            <div className="relative">
              <input
                id="confirmPassword"
                type={isConfirmPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                {...registerForSetup("confirmPassword", {
                  required: !confirmPassword ? "Confirm Password is required." : false,
                  minLength: { value: 8, message: "Password must be at least 8 characters." },
                  validate: (value) => value === password || "Password doesn't match.", // Real-time password match validation
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

          <button
            type="submit"
            disabled={loading}
            className="!mt-7 w-full rounded-lg bg-[#d4ffce] py-2.5 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[#bdf6b4] md:text-sm"
          >
            {loading ? "Processing..." : "Complete Setup"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default SetupForm;