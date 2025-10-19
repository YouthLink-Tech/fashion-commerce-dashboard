"use client";
import React, { useEffect, useRef, useState } from "react";
import useExpenseCategories from "@/app/hooks/useExpenseCategories";
import { useForm } from "react-hook-form";
import { Button, DatePicker, Tab, Tabs } from "@nextui-org/react";
import Loading from "@/app/components/shared/Loading/Loading";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineFileUpload } from "react-icons/md";
import { useAxiosSecure } from "@/app/hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { formatDate } from "@/app/components/shared/date-format/DateFormat";
import useExpenseEntries from "@/app/hooks/useExpenseEntries";

const AddExpenseEntry = () => {

  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [expenseCategoryList, isExpenseCategoryPending] = useExpenseCategories();
  const [expenseEntryList, isExpenseEntryPending,] = useExpenseEntries();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRefTags = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsInput, setTagsInput] = useState('');
  const [tagsError, setTagsError] = useState("");

  const [paidToInput, setPaidToInput] = useState("");
  const [filteredPaidTo, setFilteredPaidTo] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("attachment");
  const [link, setLink] = useState("");

  // Get available sub-categories for selected category
  const availableSubCategories = selectedCategory?.subCategories || [];

  const handleShowDateError = (date) => {
    if (date) {
      setDateError(false);
      return;
    }
    setDateError(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(""); // reset error

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, and PDF files are allowed.");
      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file); // Append the file to FormData

      const response = await axiosSecure.post('/api/gcs-file-upload/upload-single-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.fileUrl) {
        return response.data.fileUrl; // Return the file URL or path from the response
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Capitalize first letter, lowercase the rest
  const formatPaidTo = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Build unique list (case-insensitive)
  const pastPaidToValues = Array.from(
    new Map(
      expenseEntryList?.map(item => [
        item.paidTo.toLowerCase(),
        formatPaidTo(item.paidTo)
      ])
    ).values()
  );

  // Filter logic
  const handleInputChange = (value) => {
    setPaidToInput(value);

    const filtered = pastPaidToValues.filter((p) =>
      p.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPaidTo(filtered);
    setShowSuggestions(true); // Keep showing suggestions while typing
  };

  // Show all suggestions on focus
  const handleInputFocus = () => {
    setFilteredPaidTo(pastPaidToValues);
    setShowSuggestions(true);
  };

  // Select suggestion
  const handleSuggestionClick = (value) => {
    setPaidToInput(value);       // update local input state
    setValue("paidTo", value, { shouldValidate: true }); // update react-hook-form field
    setShowSuggestions(false);   // close dropdown
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle input change for sub-categories
  const handleTagsInputChange = (value) => {
    setTagsInput(value);
  };

  // Add sub-category
  const addTags = (tags) => {
    if (!tags || !tags.trim()) return;

    const trimmed = tags.trim();

    // Check for duplicate (case-insensitive)
    if (selectedTags.some(sc => sc.toLowerCase() === trimmed.toLowerCase())) {
      setTagsError(`"${trimmed}" already exists`);
      return;
    }

    // Add new tags
    setSelectedTags((prev) => [...prev, trimmed]);
    setTagsInput('');
    setTagsError('');
  };

  // Add sub-category manually
  const handleAddTags = () => {
    addTags(tagsInput);
  };

  // Remove sub-category
  const handleTagsRemove = (indexToRemove) => {
    setSelectedTags(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const { expenseCategory, subCategory, amount, dateOfExpense, paymentMethod, paidTo, notes, invoiceId } = data;

    let attachmentUrl = "";

    if (activeTab === "link") {
      // ✅ Use link directly
      if (link) {
        attachmentUrl = link;
      }
    } else if (activeTab === "attachment" && file) {
      // ✅ Upload file
      attachmentUrl = await uploadFile(file);
      if (!attachmentUrl) {
        setIsSubmitting(false);
        toast.error("Upload failed, cannot proceed.");
        return;
      }
    };

    // Check if expiryDate is selected
    if (!dateOfExpense) {
      setIsSubmitting(false);
      setDateError(true);
      return;  // Do not show toast here, just prevent submission
    }

    // If date is valid, reset the date error
    setDateError(false);

    const formattedDateOfExpense = formatDate(dateOfExpense);

    // validate tags
    if (selectedSubCategory) {
      if (selectedTags.length === 0) {
        setTagsError("Please add at least one tags.");
        setIsSubmitting(false);
        return;
      };
    }

    const expenseEntryData = {
      expenseCategory,
      subCategory,
      tags: selectedSubCategory ? selectedTags : [],
      amount: parseFloat(amount) || 0,
      dateOfExpense: formattedDateOfExpense,
      paymentMethod,
      paidTo: formatPaidTo(paidTo),
      notes,
      invoiceId,
      attachment: attachmentUrl,
    };

    try {
      const response = await axiosSecure.post('/api/expenses/entry', expenseEntryData);
      if (response.status === 201) {
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
                    Expense entry added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Expense entry has been added successfully!
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
        router.push("/finances/expenses");
      }
    } catch (error) {
      toast.error('Failed to add expense entry. Please try again!');
    } finally {
      setIsSubmitting(false); // Reset submit state at the end of submission
    }

  };

  if (isExpenseCategoryPending || isExpenseEntryPending) return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>Expense Entry Configuration</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/finances/expenses"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

            {/* Expense Category */}
            <div>
              <label htmlFor="expenseCategory" className="block font-semibold text-neutral-600 mb-2 text-sm">
                Expense Category <span className="text-red-600">*</span>
              </label>
              <select
                id="expenseCategory"
                {...register("expenseCategory", { required: "Expense category is required", value: "" })}
                defaultValue=""
                onChange={(e) => {
                  const category = expenseCategoryList.find(c => c.expenseCategory === e.target.value) || null;
                  setSelectedCategory(category);
                  setSelectedSubCategory(null);
                  setValue("subCategory", "");
                  setValue("subSubCategory", "");
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-neutral-700 bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#F4D3BA] focus:border-[#F4D3BA] text-sm cursor-pointer"
              >
                <option value="" className='bg-white'>Select Expense Category</option>
                {expenseCategoryList.map(cat => (
                  <option key={cat.expenseCategory} value={cat.expenseCategory}>
                    {cat.expenseCategory}
                  </option>
                ))}
              </select>
              {errors.expenseCategory && (
                <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.expenseCategory.message}</p>
              )}
            </div>

            {/* Sub-Category */}
            {selectedCategory && availableSubCategories.length > 0 && (
              <div>
                <label htmlFor="subCategory" className="block font-semibold text-neutral-600 mb-2 text-sm">
                  Sub-Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="subCategory"
                  {...register("subCategory", { required: "Sub-category is required" })}
                  onChange={(e) => {
                    setSelectedSubCategory(e.target.value);
                    setValue("subSubCategory", ""); // reset sub-sub-category
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-neutral-700 bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#F4D3BA] focus:border-[#F4D3BA] text-sm cursor-pointer"
                >
                  <option value="" disabled className='bg-white'>Select Sub-Category</option>
                  {availableSubCategories.map((sc, index) => (
                    <option key={index} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.subCategory.message}</p>
                )}
              </div>
            )}

            {/* Tags */}
            {selectedSubCategory && (
              <div className='flex flex-col gap-4'>

                <div className="w-full" ref={inputRefTags}>
                  <label className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">Tags <span className="text-red-600 pl-1">*</span></label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add Tags"
                      value={tagsInput}
                      onChange={(e) => {
                        handleTagsInputChange(e.target.value);
                        setTagsError(''); // clear error while typing
                      }}
                      className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                    />
                    <Button
                      type="button"
                      onPress={handleAddTags}
                      disabled={!tagsInput}
                      className={`px-5 py-3 rounded-md font-semibold ${tagsInput ? 'bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                      Add Tags
                    </Button>
                  </div>

                  {tagsError && (
                    <p className="text-left pt-1 text-red-500 font-semibold text-xs">{tagsError}</p>
                  )}

                </div>

                {/* Selected tags */}
                <div className="selected-subCategories flex flex-wrap gap-3">
                  {selectedTags?.map((tag, index) => (
                    <div key={index} className="flex items-center bg-gray-100 border border-gray-300 rounded-full py-1 px-3 text-sm text-gray-700 mb-8">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagsRemove(index)}
                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none transition-colors duration-150"
                      >
                        <RxCross2 size={19} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

          <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">

              {/* Paid To */}
              <div className="flex-1 w-full relative" ref={inputRef}>
                <label
                  htmlFor="paidTo"
                  className="flex justify-start font-semibold text-neutral-500 text-sm pb-2"
                >
                  Paid To <span className="text-red-600 pl-1">*</span>
                </label>

                <input
                  id="paidTo"
                  {...register("paidTo", { required: "Paid to is required" })}
                  value={paidToInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={handleInputFocus}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  placeholder="Enter or select recipient name"
                  type="text"
                />

                {errors.paidTo && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">
                    {errors.paidTo.message}
                  </p>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredPaidTo.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto text-sm"
                  >
                    {filteredPaidTo.map((name, i) => (
                      <li
                        key={i}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-neutral-950"
                        onClick={() => handleSuggestionClick(name)}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Amount */}
              <div className="flex-1 w-full">
                <label htmlFor='amount' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Amount ৳<span className="text-red-600 pl-1">*</span></label>
                <input
                  id='amount'
                  {...register('amount', { required: "Amount is required" })}
                  className="custom-number-input h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  placeholder='Enter Expense Amount'
                  type="number"
                />
                {errors.amount && <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.amount.message}</p>}
              </div>

              {/* Date of expense */}
              <div className='flex-1 w-full'>
                <label htmlFor='dateOfExpense' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Date of expense <span className="text-red-600 pl-1">*</span></label>
                <DatePicker
                  id='dateOfExpense'
                  placeholder="Select expense date"
                  aria-label="Select expense date"
                  onChange={(date) => {
                    handleShowDateError(date);
                    if (date instanceof Date && !isNaN(date)) {
                      setValue('dateOfExpense', date.toISOString().split('T')[0]); // Ensure it's a valid Date object and format it as YYYY-MM-DD
                    } else {
                      setValue('dateOfExpense', date); // If DatePicker returns something else, handle it here
                    }
                  }}
                  className="w-full outline-none focus:border-[#D2016E] transition-colors duration-1000 rounded-md"
                />
                {dateError && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">Please select estimated arrival date.</p>
                )}
              </div>

            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">

              {/* Payment Method */}
              <div className="flex-1 w-full">
                <label htmlFor='paymentMethod' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Payment Method <span className="text-red-600 pl-1">*</span></label>

                {/* Hidden input to connect paymentMethod to RHF */}
                <input
                  type="hidden"
                  {...register("paymentMethod", { required: "Payment method is required" })}
                />

                <div className="flex gap-3 flex-wrap">
                  {["Cash", "Mobile Wallet", "Bank Transfer", "Credit Card"].map((method) => (
                    <Button
                      key={method}
                      size="sm"
                      variant={watch("paymentMethod") === method ? "solid" : "bordered"}
                      color={watch("paymentMethod") === method ? "primary" : "default"}
                      onPress={() => setValue("paymentMethod", method)}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="flex-1 w-full">
                <label htmlFor='notes' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Notes <span className="text-red-600 pl-1">*</span></label>
                <input
                  id="notes"
                  {...register("notes", { required: "Notes is required" })}
                  className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  placeholder="Write any additional information here..."
                />
                {errors.notes && <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.notes.message}</p>}
              </div>

            </div>

          </div>

          {/* Optional Fields */}
          <div className='flex flex-col md:flex-row items-start justify-between gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

            <div className="flex-1 w-full">
              <label htmlFor='invoiceId' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2 mt-6">Invoice ID / Transaction ID</label>
              <input
                id={`invoiceId`}
                {...register(`invoiceId`)}
                className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                placeholder="Enter Invoice or Transaction ID"
                type="text"
              />
            </div>

            <div className="flex-1 w-full flex-col">
              <Tabs
                aria-label="Attachment Options"
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}>

                <Tab key="attachment" title="Attachment">
                  <div className="flex-1 w-full">
                    <div className="flex items-center w-full p-1 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <label
                        htmlFor="attachment"
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md cursor-pointer hover:bg-gray-950 transition duration-200 min-w-[110px] max-w-[110px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Choose File
                      </label>
                      <span className="ml-4 text-gray-600 truncate">
                        {file?.name || "No file chosen"}
                      </span>
                      <input
                        id="attachment"
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        accept=".jpg, .png, .pdf"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* ✅ Allowed file types and size message */}
                    <p className="mt-2 text-xs text-gray-500">
                      Allowed formats: <span className="font-medium">JPG, PNG, PDF</span> (max 10MB)
                    </p>

                    {/* ❌ Error message when validation fails */}
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

                  </div>
                </Tab>

                {/* 🔗 Link Upload Tab */}
                <Tab key="link" title="Link">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
                  />
                </Tab>

              </Tabs>
            </div>

          </div>

          <div className='flex justify-end pt-4 pb-8'>

            <button type='submit' disabled={isSubmitting} className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#d4ffce] hover:bg-[#bdf6b4]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}>
              {isSubmitting ? 'Submitting...' : 'Submit'} <MdOutlineFileUpload size={20} />
            </button>

          </div>
        </div>

      </form>

    </div>
  );
};

export default AddExpenseEntry;
