"use client";
import dynamic from 'next/dynamic';
import { Button, DatePicker, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import React, { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import FileUploadZone from './FileUploadZone';
import { RxCheck, RxCross2 } from 'react-icons/rx';
const OurStoryEditor = dynamic(() => import('@/app/utils/Editor/OurStoryEditor'), { ssr: false });
import DOMPurify from "dompurify";
import useOurStory from '@/app/hooks/useOurStory';
import axios from 'axios';
import { formatDate } from '../../shared/date-format/DateFormat';
import CustomSwitch from '../../shared/switch/CustomSwitch';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const OurStoryNavbar = () => {

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ quote: "", hashtag: "" }],
    },
  });
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const axiosSecure = useAxiosSecure();
  const [sizeError1, setSizeError1] = useState("");
  const [sizeError2, setSizeError2] = useState("");
  const [coverImgUrl, setCoverImgUrl] = useState(null);
  const [staffImgUrl, setStaffImgUrl] = useState(null);
  const [mediaUrls, setMediaUrls] = useState([]); // to store uploaded media URLs
  const handleRemoveCoverImage = () => setCoverImgUrl(null);
  const handleRemoveStaffImage = () => setStaffImgUrl(null);
  const handleRemoveMedia = (indexToRemove) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const [requiredFileErrors, setRequiredFileErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);
  const [isUploading3, setIsUploading3] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, , refetch] = useOurStory();
  const [dateError, setDateError] = useState(false);
  const [status, setStatus] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleCancel = () => {
    reset();
    setSizeError1("");
    setSizeError2("");
    setRequiredFileErrors([]);
    setCoverImgUrl(null);
    setStaffImgUrl(null);
    setMediaUrls([]);
    onClose();
  };

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await axiosSecure.post('/upload-single-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response?.data?.fileUrl) {
        return response.data.fileUrl;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const uploadSingleFileToGCS2 = async (file) => {
    try {
      // Step 1: Ask your backend for a signed upload URL
      const { data } = await axiosSecure.post('/generate-upload-url', {
        fileName: file.name,
        contentType: file.type,
      });

      const { uploadUrl, publicUrl } = data;

      // Step 2: Upload the file directly to GCS using the signed URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Step 3: Return the public URL so you can display/use the uploaded file
      return publicUrl;

    } catch (error) {
      console.error('Error uploading file to GCS:', error);
      return null;
    }
  };

  const handleCoverImgChange = async (file) => {
    if (!file) return; // guard

    setIsUploading(true); // Start Uploading
    if (file) setSizeError1(''); // ✅ clear error once file is selected

    const url = await uploadSingleFileToGCS(file);
    if (url) setCoverImgUrl(url); // store uploaded URL in state
    setIsUploading(false); // Upload finished
  };

  const handleStaffImgChange = async (file) => {
    if (!file) return;

    setIsUploading2(true); // Start Uploading
    if (file) setSizeError2(''); // ✅ clear error once file is selected

    const url = await uploadSingleFileToGCS(file);
    if (url) setStaffImgUrl(url);
    setIsUploading2(false); // Upload finished
  };

  const handleMediaSelect = async (index, file) => {
    if (!file) return;

    setIsUploading3(true); // Start upload

    // Local preview using URL.createObjectURL
    const tempUrl = URL.createObjectURL(file);

    // Update preview immediately
    const updatedUrls = [...mediaUrls];
    updatedUrls[index] = tempUrl;
    setMediaUrls(updatedUrls);

    // Clear error
    const updatedErrors = [...requiredFileErrors];
    updatedErrors[index] = '';
    setRequiredFileErrors(updatedErrors);

    // Upload and replace preview with real URL
    const uploadedUrl = await uploadSingleFileToGCS2(file);
    if (uploadedUrl) {
      updatedUrls[index] = uploadedUrl;
      setMediaUrls([...updatedUrls]);
    }

    setIsUploading3(false); // Upload finished
  };

  const handleShowDateError = (date) => {
    if (date) {
      setDateError(false);
      return;
    }
    setDateError(true);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.checked); // true or false
  };

  const onSubmit = async (data) => {
    setIsLoading(true); // Start loading

    const { departmentName, workSummary, storyPublishDate, staffName } = data;

    if (isUploading) {
      toast.error('Cover image is still uploading. Please wait...');
      return;
    }
    if (isUploading2) {
      toast.error('Staff image is still uploading. Please wait...');
      return;
    }
    if (isUploading3) {
      toast.error('Media is still uploading. Please wait...');
      return;
    }

    try {

      let hasError = false;

      if (!coverImgUrl) {
        setSizeError1("Cover image is required.");
        hasError = true;
      }

      if (!staffImgUrl) {
        setSizeError2("Staff image is required.");
        hasError = true;
      }

      // Check if expiryDate is selected
      if (!storyPublishDate) {
        setDateError(true);
        hasError = true;  // Do not show toast here, just prevent submission
      }

      let errors = [];

      if (!fields.length || !mediaUrls || mediaUrls.length === 0) {
        hasError = true;
        errors = fields.map(() => "This media upload is required.");
      } else {
        errors = fields.map((_, index) => {
          const file = mediaUrls[index];
          if (!file) {
            hasError = true;
            return "This media upload is required.";
          }
          return "";
        });
      }
      setRequiredFileErrors(errors);

      if (hasError) return;

      // Merge and proceed
      const mergedStoryInformation = data.items.map((item, index) => ({
        ...item,
        mediaSrc: mediaUrls[index] || null,
      }));

      const formattedStoryPublishDate = formatDate(storyPublishDate);

      const storyInformation = {
        departmentName,
        coverImgUrl,
        workSummary,
        storyPublishDate: formattedStoryPublishDate,
        status,
        staff: {
          staffName,
          staffImgUrl
        },
        contents: mergedStoryInformation
      };

      const response = await axiosSecure.post('/add-our-story-information', storyInformation);

      if (response.data.insertedId) {
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
                    Story Added!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Story has been added successfully!
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
        });
        refetch();
        reset();
        setSizeError1("");
        setSizeError2("");
        setRequiredFileErrors([]);
        setCoverImgUrl(null);
        setStaffImgUrl(null);
        setMediaUrls([]);
        onClose();
      }

    } catch (err) {
      toast.error("Failed to publish your work");
    } finally {
      setIsLoading(false); // End loading regardless of success/failure
    }
  };

  return (
    <>
      <div className='flex justify-between items-center sticky top-0 z-10'>
        <h1 className="font-bold text-lg md:text-xl lg:text-3xl text-neutral-600 py-1 2xl:py-3">STORY</h1>

        <button onClick={() => onOpen()} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700">
          <FaPlus size={15} className='text-neutral-700' /> Add
        </button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl'>
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="bg-gray-200">
                <h2 className="text-lg font-semibold px-2">Add New Story</h2>
              </ModalHeader>
              <ModalBody className="modal-body-scroll">
                <div className="space-y-6 px-3 py-6">

                  <div className='flex flex-col gap-2 font-semibold'>
                    <label htmlFor='departmentName' className="flex justify-start font-semibold text-neutral-500 text-sm">Department Name <span className="text-red-600 pl-1">*</span></label>
                    <input id='departmentName' {...register("departmentName", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]" placeholder='Enter Department Name' type="text" />
                    {errors.departmentName?.type === "required" && (
                      <p className="text-red-600 text-left text-xs">Department Name is required</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='uploadCoverImg' className="flex justify-start font-semibold text-neutral-500 text-sm">Upload Cover Image <span className="text-red-600 pl-1">*</span></label>
                    <FileUploadZone
                      inputId="image-upload-1"
                      description={
                        <>
                          Maximum file size is 10 MB
                          <br />
                          <span className="text-[11px] text-gray-500">
                            Required size: 450 (W) x 450 (H)
                          </span>
                        </>
                      }
                      accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                      onFileSelect={handleCoverImgChange}
                      requiredError={sizeError1}
                      validateFile={(file) => {
                        if (!file.type.startsWith("image/")) {
                          return "Only image files are allowed in this field.";
                        }
                        return null; // no error
                      }}
                      previewUrl={coverImgUrl}
                      onRemove={handleRemoveCoverImage}
                      isUploading={isUploading}
                    />
                  </div>

                  <div className="flex flex-col gap-2 font-semibold pt-4">
                    <label htmlFor='workSummary' className="flex justify-start font-semibold text-neutral-500 text-sm">Work Summary <span className="text-red-600 pl-1">*</span></label>
                    <textarea
                      {...register("workSummary", {
                        required: "Work Summary is required.",
                        minLength: {
                          value: 20,
                          message: "Work Summary must have at least 20 characters.",
                        },
                      })}
                      rows={5}
                      placeholder="Provide a Work Summary"
                      className="w-full resize-none rounded-lg border-2 border-[#ededed] px-3 py-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[#F4D3BA] md:text-sm"
                    ></textarea>
                    {errors.workSummary && (
                      <p className="text-xs font-semibold text-red-500">
                        {errors.workSummary.message}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2 font-semibold'>
                    <label htmlFor='staffName' className="flex justify-start font-semibold text-neutral-500 text-sm">Staff Name <span className="text-red-600 pl-1">*</span></label>
                    <input id='staffName' {...register("staffName", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]" placeholder='Enter Staff Name' type="text" />
                    {errors.staffName?.type === "required" && (
                      <p className="text-red-600 text-left text-xs">Staff Name is required</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='image-upload-2' className="flex justify-start font-semibold text-neutral-500 text-sm">Upload Staff Image <span className="text-red-600 pl-1">*</span></label>
                    <FileUploadZone
                      inputId="image-upload-2"
                      description={
                        <>
                          Maximum file size is 10 MB
                          <br />
                          <span className="text-[11px] text-gray-500">
                            Required size: 385 (W) x 1100 (H)
                          </span>
                          <p className="text-[11px] text-amber-600 font-semibold pt-1">Transparent background</p>
                        </>
                      }
                      accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                      onFileSelect={handleStaffImgChange}
                      requiredError={sizeError2}
                      validateFile={(file) => {
                        if (!file.type.startsWith("image/")) {
                          return "Only image files are allowed in this field.";
                        }
                        return null; // no error
                      }}
                      previewUrl={staffImgUrl}
                      onRemove={handleRemoveStaffImage}
                      isUploading={isUploading2}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='storyPublishDate' className="flex justify-start font-semibold text-neutral-500 text-sm">Story Publish Date <span className="text-red-600 pl-1">*</span></label>
                    <DatePicker
                      id='storyPublishDate'
                      placeholder="Select date"
                      aria-label="Select publish date"
                      onChange={(date) => {
                        handleShowDateError(date);
                        if (date instanceof Date && !isNaN(date)) {
                          setValue('storyPublishDate', date.toISOString().split('T')[0]); // Ensure it's a valid Date object and format it as YYYY-MM-DD
                        } else {
                          setValue('storyPublishDate', date); // If DatePicker returns something else, handle it here
                        }
                      }}
                      className="w-full outline-none focus:border-[#D2016E] transition-colors duration-1000 rounded-md"
                    />
                    {dateError && (
                      <p className="text-red-600 text-left text-xs font-semibold">Please select story publish date.</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 py-2">
                    <label htmlFor='status' className="flex justify-start font-semibold text-neutral-500 text-sm">Status:</label>
                    <div className='flex items-center gap-3'>
                      <CustomSwitch checked={status} onChange={handleStatusChange} />
                      <span className="text-sm text-gray-500">{status ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="relative border p-4 rounded-lg shadow-sm space-y-4">

                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            remove(index);
                            setMediaUrls(prev => prev.filter((_, i) => i !== index)); // remove media URL at index
                          }}
                          className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}

                      {/* Upload Media Content */}
                      <div className="flex flex-col gap-3">
                        <label htmlFor={`media-upload-${index}`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Upload Media Content
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <FileUploadZone
                          inputId={`media-upload-${index}`}
                          description={
                            <>
                              Maximum file size is 50 MB
                              <br />
                              <span className="text-[11px] text-gray-500">
                                Required size: 640 (W) x 360 (H)
                              </span>
                            </>
                          }
                          accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4']}
                          onFileSelect={(file) => handleMediaSelect(index, file)}
                          requiredError={requiredFileErrors[index]}
                          previewUrl={[mediaUrls[index]]}
                          onRemove={() => handleRemoveMedia(index)}
                          isUploading={isUploading3}
                        />
                      </div>

                      {/* Hashtag Input */}
                      <div className="flex flex-col gap-2 font-semibold">
                        <label htmlFor={`items.${index}.hashtag`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Hashtag
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <input
                          id={`items.${index}.hashtag`}
                          {...register(`items.${index}.hashtag`, { required: true })}
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]"
                          placeholder="Enter Hashtag"
                          type="text"
                        />
                        {errors?.items?.[index]?.hashtag?.type === 'required' && (
                          <p className="text-red-600 text-left text-xs font-semibold">Hashtag is required</p>
                        )}
                      </div>

                      {/* Quote Input */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`items.${index}.quote`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Quote
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <Controller
                          name={`items.${index}.quote`}
                          control={control}
                          defaultValue=""
                          rules={{
                            validate: (value) => {
                              const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                              if (!strippedText) return "Quote is required.";
                              if (strippedText.length < 10) return "Quote must be at least 10 characters.";
                              return true;
                            },
                          }}
                          render={({ field }) => (
                            <OurStoryEditor
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        {errors?.items?.[index]?.quote && (
                          <p className="text-red-600 text-left text-xs font-semibold">
                            {errors.items[index].quote.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>

              </ModalBody>

              <ModalFooter className='flex justify-between items-center border'>
                <button type='button'
                  onClick={() => {
                    append({ quote: "", hashtag: "" });
                    setMediaUrls(prev => [...prev, null]);
                  }}
                  className="w-fit rounded-lg bg-[#d4ffce] hover:bg-[#bdf6b4] px-3 py-2 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out"
                >
                  <FaPlus /> Add Media Content
                </button>
                <div className='flex gap-4 items-center'>
                  <Button
                    type="button"
                    onPress={handleCancel}
                    color="danger"
                    variant="light"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={isUploading}
                    className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700"
                  >
                    {isLoading ? 'Uploading...' : 'Upload'}
                  </Button>

                </div>
              </ModalFooter>

            </form>
          )}
        </ModalContent>
      </Modal>

    </>
  );
};

export default OurStoryNavbar;