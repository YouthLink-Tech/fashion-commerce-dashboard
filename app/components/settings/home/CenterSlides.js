import Image from 'next/image';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { MdCancel, MdOutlineFileUpload } from 'react-icons/md';

const CenterSlides = ({ image2, setImage2, setSizeError2, sizeError2, axiosSecure, dragging2, setDragging2 }) => {

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 6;

  const handleImagesChange = async (event) => {
    const files = Array.from(event.target.files);
    await processFiles(files);
  };

  // Extend validateFiles to also check size limit
  const validateFiles = (files) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    // Filter by type and size
    return files.filter(file =>
      validTypes.includes(file.type) && file.size <= MAX_IMAGE_SIZE
    );
  };

  const processFiles = async (files) => {
    const validFiles = validateFiles(files);

    if (validFiles.length === 0) {
      setSizeError2("Please select valid image files (PNG, JPEG, JPG, WEBP) less than 10MB.");
      return;
    }

    const totalImages = validFiles.length + image2.length;
    if (totalImages > MAX_FILES) {
      setSizeError2(`You can only upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    const imageUrls = await uploadFilesToGCS(newImages);
    const updatedUrls = [...image2, ...imageUrls];
    const limitedUrls = updatedUrls.slice(-MAX_FILES);

    setImage2(limitedUrls);
    setSizeError2('');
  };

  // Drag handlers to support UI feedback for dragging state
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging2(true);
  };

  const handleDragLeave = () => {
    setDragging2(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging2(false);
    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);
  };

  const uploadFilesToGCS = async (files) => {
    try {
      const formData = new FormData();

      for (const image of files) {
        formData.append('file', image.file); // ✅ correctly send the File object
      }
      const response = await axiosSecure.post('/upload-multiple-files', formData, {
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

  const handleImageRemove = (index) => {
    const updated = [...image2];
    updated.splice(index, 1);
    setImage2(updated);
  };

  const handleOnDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(image2);
    const [movedItem] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, movedItem);

    setImage2(reordered);
  };

  return (
    <div className='flex-1 flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg h-fit'>
      <label htmlFor={`center-slide-images`} className="font-semibold">
        Center Slide Images <span className="text-red-600">*</span>
      </label>
      <input
        id='centerSlideImageUpload'
        type='file'
        className='hidden'
        multiple
        onChange={handleImagesChange}
      />
      <label
        htmlFor='centerSlideImageUpload'
        className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-3 border-dashed border-neutral-200 hover:bg-blue-50 hover:border-blue-300 duration-1000 ${dragging2 ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
          } p-6 cursor-pointer`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <MdOutlineFileUpload size={60} />
        <div className='space-y-1.5 text-center text-neutral-500 font-semibold'>
          <p className="text-[13px]">
            <span className="text-blue-300 underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-blue-400">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-[11px]">Max image size is 10 MB</p>
          <p className="text-[11px]">Up to 6 images allowed</p>
          <p className="text-[11px] text-gray-500">Required size : 900 (W) x 400 (H)</p>
        </div>
      </label>

      {sizeError2 && (
        <p className="text-left pt-1 text-red-500 font-semibold text-xs">{sizeError2}</p>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        {/* Row 1: Images 0–2 */}
        <Droppable droppableId="row1" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-3 gap-4 mt-4"
            >
              {image2.slice(0, 3).map((url, index) => (
                <Draggable key={url} draggableId={`row1-${url}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative bg-white border border-gray-300 rounded-md"
                    >
                      <Image
                        src={url}
                        height={2000}
                        width={2000}
                        alt={`Image ${index + 1}`}
                        className="w-full h-[200px] object-cover rounded-md duration-300 ease-in-out"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                        type='button'
                      >
                        <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Row 2: Images 3–5 */}
        <Droppable droppableId="row2" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-3 gap-4 mt-4"
            >
              {image2.slice(3, 6).map((url, index) => (
                <Draggable key={url} draggableId={`row2-${url}`} index={index + 3}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative bg-white border border-gray-300 rounded-md"
                    >
                      <Image
                        src={url}
                        height={2000}
                        width={2000}
                        alt={`Image ${index + 4}`}
                        className="w-full h-[200px] object-cover rounded-md duration-300 ease-in-out"
                      />
                      <button
                        onClick={() => handleImageRemove(index + 3)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                        type='button'
                      >
                        <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
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
  );
};

export default CenterSlides;