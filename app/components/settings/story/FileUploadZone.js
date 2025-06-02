'use client';
import { useState } from 'react';
import { MdOutlineFileUpload } from 'react-icons/md';
import { MdCancel } from "react-icons/md";
import Image from 'next/image';

export default function FileUploadZone({
  description = "Accepted formats: PNG, JPG",
  accept = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  multiple = false,
  onFileSelect,
  inputId = "fileUpload",
  validateFile, // ✅ NEW: Validation function
  requiredError,
  previewUrl,
  onRemove,
  isUploading
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 50MB

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (validateFile) {
      const errorMessage = await validateFile(file);
      if (errorMessage) {
        setError(errorMessage);
        return;
      }
    }

    const isAcceptedType = accept.includes(file.type);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isAcceptedType) {
      setError('Only accepted formats (PNG, JPG, JPEG, WEBP, MP4) are allowed.');
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than or equal to 10MB.');
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setError('Video size must be less than or equal to 100MB.');
      return;
    }

    setError('');
    onFileSelect?.(file);
  };

  return (
    <div className='flex flex-col gap-4'>
      <input
        id={inputId}
        type='file'
        className='hidden'
        onChange={handleChange}
        accept={accept.join(',')}
        multiple={multiple}
      />
      <div className='flex flex-col gap-1'>
        <label
          htmlFor={inputId}
          className={`flex flex-col items-center justify-center space-y-3 rounded-lg border-3 border-dashed border-neutral-200 hover:bg-blue-50 hover:border-blue-300 duration-1000 ${dragging ? 'border-blue-300 bg-blue-50' : 'border-gray-400 bg-white'
            } p-6 cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <MdOutlineFileUpload size={60} />
          <div className='space-y-1.5 text-center text-neutral-500 font-semibold'>
            <p className="text-[13px]">
              <span className="text-blue-300 underline underline-offset-2 transition-[color] duration-300 ease-in-out hover:text-blue-400">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-[11px]">{description}</p>
          </div>
        </label>

        {(error || requiredError) && <p className="text-left pt-1 text-red-500 font-semibold text-xs">{error || requiredError}</p>}
      </div>

      {isUploading && (
        <div>Uploading...</div>
      )}

      {previewUrl && (
        <div className="relative flex flex-wrap gap-4">
          {Array.isArray(previewUrl)
            ? previewUrl.map((url, idx) => {
              if (!url) return null; // <-- skip if url is empty or falsy

              const isImage = url.startsWith('data:image') || url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
              const isVideo = url.match(/\.(mp4)$/i);

              return (
                <div key={idx} className="relative w-[300px] max-h-[200px] mx-auto">
                  {isImage ? (
                    <Image
                      src={url}
                      alt={`preview-${idx}`}
                      width={3000}
                      height={2000}
                      sizes='400px'
                      className="w-full max-h-[200px] object-cover rounded-md duration-300 ease-in-out"
                    />
                  ) : isVideo ? (
                    <video
                      src={url}
                      controls
                      className="w-full max-h-[200px] object-cover rounded-md duration-300 ease-in-out"
                    />
                  ) : null}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => onRemove(idx)}
                    >
                      <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                    </button>
                  )}
                </div>
              );
            })
            : (
              <div className="relative w-[300px] max-h-[200px] mx-auto">
                {(previewUrl.startsWith('data:image') || previewUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i)) ? (
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={3000}
                    height={2000}
                    sizes='400px'
                    className="w-full max-h-[200px] object-cover rounded-md duration-300 ease-in-out"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-[200px] object-cover rounded-md duration-300 ease-in-out"
                  />
                )}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={onRemove}
                  >
                    <MdCancel className="absolute right-0 top-0 size-[22px] -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full bg-white text-red-500 transition-[color] duration-300 ease-in-out hover:text-red-600" size={18} />
                  </button>
                )}
              </div>
            )}
        </div>
      )}

    </div>
  );
}
