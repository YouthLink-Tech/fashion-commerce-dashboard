"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Loading from '../shared/Loading/Loading';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import useLoginRegisterSlides from '@/app/hooks/useLoginRegisterSlides';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';

const LoginRegisterSlides = () => {

  const { handleSubmit } = useForm();
  const axiosSecure = useAxiosSecure();
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [sizeError, setSizeError] = useState(false);
  const [loginRegisterImageList, isLoginRegisterImagePending, refetch] = useLoginRegisterSlides();

  // Load existing images from loginRegisterImageList on mount
  useEffect(() => {
    if (loginRegisterImageList?.[0]?.urls) {
      setUploadedImageUrls(loginRegisterImageList[0].urls);
    }
  }, [loginRegisterImageList]);

  const handleImagesChange = async (event) => {
    const files = Array.from(event.target.files);

    // Prevent adding new images if there's already an array
    if (loginRegisterImageList?.[0]?.urls?.length > 10) {
      toast.error("Images already exist. Update or delete existing images instead.");
      return;
    }

    if (files.length === 0) {
      setSizeError(true);
      return;
    } else {
      setSizeError(false);
    }

    await processFiles(files);
  };

  const processFiles = async (files) => {
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (PNG, JPEG, JPG, WEBP).");
      return;
    }

    const totalImages = validFiles.length + uploadedImageUrls.length;
    if (totalImages > 10) {
      toast.error("You can only upload a maximum of 10 images.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    const imageUrls = await uploadMultipleFilesToGCS(newImages);
    const updatedUrls = [...uploadedImageUrls, ...imageUrls];
    const limitedUrls = updatedUrls.slice(-10);

    setUploadedImageUrls(limitedUrls);
    if (limitedUrls.length > 0) {
      setSizeError(false);
    }
  };

  const validateFiles = (files) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    return files.filter(file => validTypes.includes(file.type));
  };

  const uploadMultipleFilesToGCS = async (images) => {
    try {
      const formData = new FormData();

      for (const image of images) {
        formData.append('file', image.file); // ✅ correctly send the File object
      }
      const response = await axiosSecure.post('/api/gcs-file-upload/upload-multiple-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.urls) {
        return response.data.urls; // Expected to be an array of public URLs
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      return [];
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleImageRemove = (index) => {
    const updatedUrls = uploadedImageUrls.filter((_, i) => i !== index);
    setUploadedImageUrls(updatedUrls);
  };

  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    // If there's no destination, exit early
    if (!destination) return;

    // If source and destination are the same, and index hasn't changed, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create deep copies of row1 and row2 lists
    const updatedRow1 = [...uploadedImageUrls.slice(0, 5)];
    const updatedRow2 = [...uploadedImageUrls.slice(5)];

    let draggedItem;

    // Remove the dragged item from the source row
    if (source.droppableId === "row1") {
      draggedItem = updatedRow1.splice(source.index, 1)[0];
    } else {
      draggedItem = updatedRow2.splice(source.index, 1)[0];
    }

    // Add the dragged item to the destination row
    if (destination.droppableId === "row1") {
      updatedRow1.splice(destination.index, 0, draggedItem);
    } else {
      updatedRow2.splice(destination.index, 0, draggedItem);
    }

    // Update the `uploadedImageUrls` state
    setUploadedImageUrls([...updatedRow1, ...updatedRow2]);
  };

  const onSubmit = async () => {

    if (uploadedImageUrls.length === 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    try {
      const loginRegisterImageUrls = { urls: uploadedImageUrls };
      if (loginRegisterImageList?.[0]?._id) {
        const res = await axiosSecure.put(`/api/login-register-images/edit/${loginRegisterImageList[0]._id}`, loginRegisterImageUrls);
        if (res.data.modifiedCount > 0) {
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
                      Slide images updated!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Slide images has been successfully updated!
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
          refetch();
        } else {
          toast.error('No changes detected!');
        }
      } else {
        const response = await axiosSecure.post('/api/login-register-images/add', loginRegisterImageUrls);
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
                      Slide images published!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Slide images has been successfully published!
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
          refetch();
        }
      }
    } catch {
      toast.error("Failed to publish login register slides!");
    }
  };

  if (isLoginRegisterImagePending) {
    return <Loading />
  }

  return (
    <div className='my-3'>

      <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-8 py-3 h-fit'>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
          <input
            id='imageUpload'
            type='file'
            className='hidden'
            multiple
            onChange={handleImagesChange}
          />
          <label
            htmlFor='imageUpload'
            className='mx-auto flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-gray-400 py-16 px-6 bg-white w-full'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <MdOutlineFileUpload size={60} />
            <div className='space-y-1.5 text-center'>
              <h5 className='whitespace-nowrap text-lg font-medium tracking-tight'>
                Upload or Drag Media
              </h5>
              <p className='text-sm text-gray-500'>
                Photos Should be in PNG, JPEG, JPG or WEBP format
              </p>
            </div>
          </label>
          {sizeError && (
            <p className="text-red-600 text-center">Please select at least one image</p>
          )}

          <DragDropContext onDragEnd={handleOnDragEnd}>
            {/* First Row: Images 0–4 */}
            <Droppable droppableId="row1" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-3 lg:grid-cols-5 gap-4 mt-4"
                >
                  {uploadedImageUrls.slice(0, 5).map((url, index) => (
                    <Draggable key={url} draggableId={`row1-${url}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center mb-2 p-2 bg-white border border-gray-300 rounded-md relative"
                        >
                          <Image
                            src={url}
                            height={2000}
                            width={2000}
                            alt={`Uploaded image ${index + 1}`}
                            className="w-full h-auto max-h-[250px] rounded-md object-contain"
                          />
                          <button
                            onClick={() => handleImageRemove(index)}
                            className="absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            <RxCross2 size={24} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Second Row: Images 5–9 */}
            <Droppable droppableId="row2" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-3 lg:grid-cols-5 gap-4 mt-4"
                >
                  {uploadedImageUrls.slice(5).map((url, index) => (
                    <Draggable key={url} draggableId={`row2-${url}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center mb-2 p-2 bg-white border border-gray-300 rounded-md relative"
                        >
                          <Image
                            src={url}
                            height={2000}
                            width={2000}
                            alt={`Uploaded image ${index + 6}`}
                            className="w-full h-auto max-h-[250px] rounded-md object-contain"
                          />
                          <button
                            onClick={() => handleImageRemove(index + 5)}
                            className="absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            <RxCross2 size={24} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

        </div>

        {/* Submit Button */}
        <div className='flex justify-end items-center'>
          <button
            type='submit'
            className={`bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 py-2 px-4 text-sm rounded-lg cursor-pointer font-bold transition-[background-color] duration-300`}
          >
            Upload
          </button>
        </div>
      </form>

    </div>
  );
};

export default LoginRegisterSlides;