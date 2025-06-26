"use client";
import React, { useEffect, useState } from 'react';
import useOurStory from '@/app/hooks/useOurStory';
import Swal from 'sweetalert2';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import { useDisclosure } from '@nextui-org/react';
import StoryGrid from './StoryGrid';
import ViewStoryModal from './ViewStoryModal';
import { useFieldArray, useForm } from 'react-hook-form';
import StoryEditModal from './StoryEditModal';
import axios from 'axios';
import { formatDate } from '../../shared/date-format/DateFormat';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const OurStories = () => {

  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [ourStoryList, isOurStoryPending, refetch] = useOurStory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ quote: "", hashtag: "" }],
    },
  });
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
  const [status, setStatus] = useState(false);
  const [storyPublishDate, setStoryPublishDate] = useState('');

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const fetchStoryData = async () => {
      if (!selectedStoryId) return;

      try {
        const { data } = await axiosSecure.get(`/get-single-story/${selectedStoryId}`);

        if (data) {
          const fetchedStoryPublishDate = formatDate(data.storyPublishDate);
          setStoryPublishDate(fetchedStoryPublishDate);
          setStatus(data.status);
          setCoverImgUrl(data.coverImgUrl);
          setStaffImgUrl(data.staff?.staffImgUrl);
          setMediaUrls(data.contents.map(item => item.mediaSrc));
          reset({
            departmentName: data?.departmentName || "",
            workSummary: data?.workSummary || "",
            staffName: data?.staff?.staffName || "",
            storyPublishDate: fetchedStoryPublishDate || "",
            items: data?.contents?.map(item => ({
              quote: item.quote,
              hashtag: item.hashtag
            }))
          });
        }

      } catch (error) {
        console.error(error);
        toast.error("Failed to load story details.");
      }
    };

    fetchStoryData();
  }, [selectedStoryId, setValue, reset, axiosSecure]);

  const handleDelete = async (storyId) => {
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
          const res = await axiosSecure.delete(`/delete-story/${storyId}`);
          if (res?.data?.deletedCount) {
            refetch();
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
                        Story Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Story has been deleted successfully!
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
          toast.error('Failed to delete story. Please try again.');
        }
      }
    });
  };

  const handleOpenEditStoryModal = async (storyId) => {
    setSelectedStoryId(storyId);
    setIsEditOpen(true);
  };

  const handleViewStoryModal = (story) => {
    setSelectedStory(story);
    onOpen();
  };

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await axiosPublic.post('/upload-single-file', formData, {
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
      const { data } = await axiosPublic.post('/generate-upload-url', {
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

  const handleStatusChange = (e) => {
    setStatus(e.target.checked); // true or false
  };

  const onSubmit = async (data) => {
    setIsLoading(true); // Start loading

    const { departmentName, workSummary, staffName } = data;

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

      const editStoryInformation = {
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

      const response = await axiosSecure.put(`/update-our-story/${selectedStoryId}`, editStoryInformation);

      if (response.data.modifiedCount > 0) {
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
                    Story Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Story has been updated successfully!
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
        setIsEditOpen(false);
      } else {
        toast.error('No changes detected.');
      }

    } catch (err) {
      toast.error("Failed to update your story");
    } finally {
      setIsLoading(false); // End loading regardless of success/failure
    }
  };

  return (
    <div className='mt-6'>

      <StoryGrid
        ourStoryList={ourStoryList}
        handleViewStoryModal={handleViewStoryModal}
        handleOpenEditStoryModal={handleOpenEditStoryModal}
        handleDelete={handleDelete}
        isOurStoryPending={isOurStoryPending}
      />

      <ViewStoryModal
        isOpen={isOpen}
        onClose={onClose}
        selectedStory={selectedStory}
      />

      <StoryEditModal
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        control={control}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
        storyPublishDate={storyPublishDate}
        setStoryPublishDate={setStoryPublishDate}
        coverImgUrl={coverImgUrl}
        handleCoverImgChange={handleCoverImgChange}
        handleRemoveCoverImage={handleRemoveCoverImage}
        staffImgUrl={staffImgUrl}
        handleStaffImgChange={handleStaffImgChange}
        handleRemoveStaffImage={handleRemoveStaffImage}
        status={status}
        handleStatusChange={handleStatusChange}
        mediaUrls={mediaUrls}
        handleMediaSelect={handleMediaSelect}
        handleRemoveMedia={handleRemoveMedia}
        setMediaUrls={setMediaUrls}
        isUploading={isUploading}
        isUploading2={isUploading2}
        isUploading3={isUploading3}
        sizeError1={sizeError1}
        sizeError2={sizeError2}
        requiredFileErrors={requiredFileErrors}
        isLoading={isLoading}
      />

    </div>
  );
};

export default OurStories;