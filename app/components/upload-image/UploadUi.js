import React from 'react';
import { MdOutlineFileUpload } from 'react-icons/md';

const UploadUi = ({
  dragging,
  setDragging,
  imageError,
  setImageError,
  onUploadSuccess,
  uploadFile
}) => {

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {

    if (!VALID_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload JPG, PNG, WEBP, or JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be smaller than 10MB.');
      return;
    }

    setImageError('');

    const uploadedImageUrl = await uploadFile(file); // ✅ call parent's upload function
    if (uploadedImageUrl) {
      onUploadSuccess(uploadedImageUrl); // ✅ pass URL back to parent
    }

  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <>
      <input
        id='imageUpload'
        type='file'
        className='hidden'
        onChange={handleImageChange}
      />
      <label
        htmlFor='imageUpload'
        className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed duration-500 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
          } hover:border-blue-300 hover:bg-blue-50 p-6 cursor-pointer`}
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
        </div>
      </label>

      {imageError && (
        <p className="text-left pt-3 text-red-500 font-semibold text-xs">{imageError}</p>
      )}
    </>
  );
};

export default UploadUi;