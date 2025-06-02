"use client";
import useAxiosPublic from "@/app/hooks/useAxiosPublic";
import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { permissionsList } from "@/permissionList";
import Drawer from "./Drawer";
import { HiCheckCircle } from "react-icons/hi2";

export default function CartDrawer({
  isGrantAccessOpen,
  setIsGrantAccessOpen,
  refetch
}) {

  const { register, reset, handleSubmit, formState: { errors } } = useForm();
  const axiosPublic = useAxiosPublic();
  const [roleGroups, setRoleGroups] = useState([
    { role: "", modules: {} },
  ]);
  const [roleErrors, setRoleErrors] = useState([]);    // one entry per role group
  const [moduleErrors, setModuleErrors] = useState([]); // one entry per role group
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAny = dropdownRefs.current.some((ref) => {
        return ref && ref.contains(event.target);
      });

      if (!clickedInsideAny) {
        setOpenDropdownIndex(null);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddGroup = () => {
    setRoleGroups((prev) => [...prev, { role: "", modules: {} }]);
  };

  const handleDeleteGroup = (indexToRemove) => {
    setRoleGroups((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRoleChange = (index, selectedRole) => {
    const modulesFromPermissions = permissionsList[selectedRole] || {};
    const newModules = {};

    for (let moduleName in modulesFromPermissions) {
      newModules[moduleName] = { access: false };
    }

    const updatedGroups = [...roleGroups];
    updatedGroups[index] = { role: selectedRole, modules: newModules };
    setRoleGroups(updatedGroups);

    // Clear role error if it was previously set
    setRoleErrors(prevErrors => {
      const updatedErrors = [...prevErrors];
      updatedErrors[index] = ''; // clear error for this index
      return updatedErrors;
    });

  };

  const toggleModule = (groupIndex, moduleName) => {
    const updatedGroups = [...roleGroups];
    const current = updatedGroups[groupIndex];
    const currentStatus = current.modules[moduleName].access;

    // Prevent enabling if already used elsewhere
    if (!currentStatus && isModuleSelectedElsewhere(groupIndex, moduleName)) {
      return;
    }

    current.modules[moduleName].access = !currentStatus;
    setRoleGroups(updatedGroups);

    // Check if at least one module is selected, then clear error
    const hasSelectedModule = Object.values(updatedGroups[groupIndex].modules).some(
      module => module.access
    );

    if (hasSelectedModule) {
      setModuleErrors(prevErrors => {
        const updated = [...prevErrors];
        updated[groupIndex] = ''; // clear error
        return updated;
      });
    }

  };

  // Collect all modules selected across all groups except current group
  const isModuleSelectedElsewhere = (currentIndex, moduleName) => {
    return roleGroups.some((group, i) => {
      if (i === currentIndex) return false;
      return group.modules?.[moduleName]?.access;
    });
  };

  const handleCancel = () => {
    setIsGrantAccessOpen(false); // close the drawer
    reset(); // resets the react-hook-form input like email
    setRoleGroups([{ role: "", modules: {} }]); // resets roleGroups to initial state
    setRoleErrors([]); // clear role errors
    setModuleErrors([]); // clear module errors
  };

  const onSubmit = async (data) => {

    // Check if no role is added at all
    if (roleGroups.length === 0) {
      toast.error('Please add a role');
      return;
    }

    const newRoleErrors = [];
    const newModuleErrors = [];
    let isValid = true;

    roleGroups.forEach((group, index) => {
      if (!group.role) {
        newRoleErrors[index] = 'Role is required';
        isValid = false;
      } else {
        newRoleErrors[index] = '';
      }

      const hasAccess = Object.values(group.modules || {}).some(m => m.access);
      if (!hasAccess) {
        newModuleErrors[index] = 'One module selection is required';
        isValid = false;
      } else {
        newModuleErrors[index] = '';
      }
    });

    setRoleErrors(newRoleErrors);
    setModuleErrors(newModuleErrors);

    if (!isValid) return;

    try {

      const enrollmentInformation = {
        email: data.email,
        permissions: roleGroups
      };

      const response = await axiosPublic.post('/invite', enrollmentInformation);

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
                    Invitation Sent Successfully!
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
        reset();
        refetch();
        setIsGrantAccessOpen(false); // close the drawer
        setRoleGroups([{ role: "", modules: {} }]); // resets roleGroups to initial state
        setRoleErrors([]); // clear role errors
        setModuleErrors([]); // clear module errors

      } else {

        // ⚠️ Handle the case where email sending failed but user data was inserted
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
          >
            <div className="pl-6">
              <RxCross2 className="h-6 w-6 bg-yellow-500 text-white rounded-full" />
            </div>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-base font-bold text-gray-900">
                    Email Sending Failed
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    The user was added, but the invitation email could not be sent.
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
                  Invitation Failed!
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

  };

  return (
    <Drawer
      isDrawerOpen={isGrantAccessOpen}
      drawerBgId="cart-bg"
      drawerResponsiveWidths="w-full sm:w-3/4 md:w-[850px]"
    >

      <div className="font-semibold">

        <p className="border-0 border-b-2 pb-3">
          <span className="text-neutral-900 text-xl px-6">Grant access</span>
        </p>

        <p className="px-6 pt-6 max-w-xl">
          <span className="text-sm text-neutral-600">Grant principals access to this resource and add roles to specify what actions the principals can take. Optionally, add conditions to grant access to principals only when a specific criteria is met.</span>
        </p>

        <form className="space-y-8 px-6 pt-6" onSubmit={handleSubmit(onSubmit)}>

          <p className="flex flex-col">
            <span className="text-neutral-900 text-lg">Add principals</span>
            <span className="text-neutral-500 text-sm">Principals are users, groups or service accounts.</span>
          </p>

          <div className="w-full space-y-2 font-semibold bg-gray-50 max-w-lg">
            <label className="text-sm" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john.doe@gmail.com"
              autoComplete="email"
              {...register("email", {
                pattern: {
                  value:
                    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/,
                  message: "Email is not valid.",
                },
                required: {
                  value: true,
                  message: "Email is required.",
                },
              })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]"
            />
            {/* Email Error Message */}
            {errors.email && (
              <p className="text-xs font-semibold text-red-500">
                {errors.email?.message}
              </p>
            )}
          </div>

          <div className="space-y-6">

            {roleGroups.map((group, index) => {
              return (
                <div
                  key={index}
                  ref={(el) => (dropdownRefs.current[index] = el)}
                  className="border rounded-lg p-4 bg-gray-50 relative max-w-lg"
                >

                  <div className="flex justify-between items-center mb-5">

                    <div className="w-full max-w-sm">
                      <Select
                        label="Select a role *"
                        selectedKeys={group.role ? [group.role] : []}
                        onChange={(e) => handleRoleChange(index, e.target.value)}
                        className="w-full"
                        variant="underlined"
                        size="sm"
                      >
                        {Object.keys(permissionsList).map((roleName) => (
                          <SelectItem textValue={roleName} key={roleName} value={roleName}>
                            {roleName}
                          </SelectItem>
                        ))}
                      </Select>
                      {roleErrors[index] && <p className="left-0 text-xs font-semibold text-red-500">{roleErrors[index]}</p>}
                    </div>

                    <button
                      onClick={() => handleDeleteGroup(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                      type="button"
                    >
                      <FaTrash />
                    </button>

                  </div>

                  {group.role && (
                    <div className="w-full relative max-w-lg mt-4">
                      {/* Label */}
                      <label className="flex justify-start font-bold text-xs text-neutral-900 pb-2">
                        Select modules *
                      </label>

                      {/* Input Field (Show selected OR searchTerm) */}
                      <input
                        type="search"
                        value={
                          openDropdownIndex === index
                            ? searchTerm
                            : Object.keys(group.modules)
                              .filter((moduleName) => group.modules[moduleName].access)
                              .join(", ")
                        }
                        onClick={() => setOpenDropdownIndex(index)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search & Select Modules"
                        className="mb-2 w-full rounded-md border border-gray-300 p-2 outline-none transition-colors duration-1000 focus:border-[#F4D3BA] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-neutral-700"
                      />

                      {/* Module Dropdown */}
                      {openDropdownIndex === index && (
                        <div className="absolute z-[99] left-0 right-0 border bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto p-2 space-y-1">
                          {Object.keys(group.modules)
                            .filter((moduleName) =>
                              moduleName.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((moduleName) => {
                              const isDisabled =
                                !group.modules[moduleName].access &&
                                isModuleSelectedElsewhere(index, moduleName);

                              const isSelected = group.modules[moduleName].access;

                              return (
                                <div
                                  key={moduleName}
                                  onClick={() => { if (!isDisabled) toggleModule(index, moduleName) }}
                                  className={`flex items-center justify-between cursor-pointer rounded-lg border text-neutral-700 text-sm pl-4 pr-2 py-2 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${isSelected ? 'border-[#d7ecd2] bg-[#fafff9]' : 'border-neutral-100'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#d7ecd2] hover:bg-[#fafff9]'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{moduleName}</span>
                                  </div>
                                  <HiCheckCircle
                                    className={`pointer-events-none size-6 text-[#60d251] transition-opacity duration-300 ease-in-out ${isSelected ? "opacity-100" : "opacity-0"}`}
                                  />

                                  {isDisabled && (
                                    <span className="text-red-500 text-xs ml-2">
                                      (Already selected)
                                    </span>
                                  )}

                                </div>
                              );
                            })}

                          {/* No results found */}
                          {Object.keys(group.modules).filter((moduleName) =>
                            moduleName.toLowerCase().includes(searchTerm.toLowerCase())
                          ).length === 0 && (
                              <p className="text-neutral-700 text-sm text-center">No modules found</p>
                            )}
                        </div>
                      )}

                      {/* Error */}
                      {moduleErrors[index] && (
                        <p className="left-0 text-xs font-semibold text-red-500">
                          {moduleErrors[index]}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              )
            })}

          </div>

          <button
            type="button"
            onClick={handleAddGroup}
            className="text-blue-600 font-medium flex items-center gap-2 hover:bg-blue-50 rounded-lg px-3 py-1.5 hover:text-blue-700 text-sm"
          >
            Add another role <FaPlus />
          </button>

          <div className='w-full flex gap-2 items-center relative pb-32'>
            <button
              type="submit"
              className="w-fit rounded-lg bg-[#0c76df] px-3 py-2 text-xs font-semibold text-white transition-[background-color] duration-300 hover:bg-[#0C67DF] md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-fit rounded-lg border border-[#0C67DF] px-3 py-1.5 text-xs font-semibold text-[#0C67DF] transition-[background-color] duration-300 hover:bg-blue-50 md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>

    </Drawer>
  );
}
