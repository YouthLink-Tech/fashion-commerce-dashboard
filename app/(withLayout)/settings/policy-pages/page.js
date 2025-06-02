"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import usePolicyPages from '@/app/hooks/usePolicyPages';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RxCheck, RxCross2 } from 'react-icons/rx';

const policyLabels = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'refund', label: 'Refund Policy' },
  { key: 'shipping', label: 'Shipping Policy' },
  { key: 'return', label: 'Return Policy' },
];

const PolicyPages = () => {
  const axiosPublic = useAxiosPublic();
  const { handleSubmit } = useForm();
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({}); // Tracks missing fields
  const [uploadedUrls, setUploadedUrls] = useState({});
  const [policyPagesList, isPolicyPagesPending, refetch] = usePolicyPages();
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (policyPagesList && policyPagesList.length > 0) {
      const urls = policyPagesList[0];
      const reconstructedFiles = {};

      for (const key of Object.keys(urls)) {
        // Only include expected policy keys
        if (!policyLabels.some(label => label.key === key)) continue;

        const fileUrl = urls[key];
        if (typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
          reconstructedFiles[key] = {
            name: fileUrl.split('/').pop()?.split('?')[0] || `${key}.pdf`,
            url: fileUrl,
          };
        }
      }

      setFiles(reconstructedFiles);
      setUploadedUrls(urls);
    }
  }, [policyPagesList]);

  const handleFileChange = (e, key) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFiles(prev => ({ ...prev, [key]: selectedFile }));

      // Clear error if previously missing
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const uploadFile = async (file, key) => {
    const formData = new FormData();
    formData.append(key, file);
    const response = await axiosPublic.post('/upload-multiple-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response?.data?.urls;
  };

  const handleClearFile = (key) => {
    setFiles(prev => {
      const updatedFiles = { ...prev };
      delete updatedFiles[key];  // Remove the file for the given key
      return updatedFiles;
    });

    // Optionally, clear the uploaded URLs if the file is being removed
    setUploadedUrls(prev => {
      const updatedUrls = { ...prev };
      delete updatedUrls[key];  // Remove the URL for the given key
      return updatedUrls;
    });
  };

  const onSubmit = async (data) => {

    const missing = {};
    policyLabels.forEach(({ key }) => {
      if (!files[key]) {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        missing[key] = `${capitalizedKey} pdf is required`;
      }
    });

    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      toast.error("Please upload all required files");
      return;
    }

    if (policyPagesList?.length > 0) {
      const pdfId = policyPagesList[0]?._id;

      const uploadResults = {};

      for (const { key } of policyLabels) {
        const file = files[key];

        if (file instanceof File) {
          // If it's a new file, upload it
          const url = await uploadFile(file, key);
          if (!url?.[0]) {
            toast.error(`Upload failed for ${key}`);
            return;
          }
          uploadResults[key] = url[0];
        } else if (file?.url) {
          // If it's an existing file (not changed), reuse its URL
          uploadResults[key] = file.url;
        } else {
          toast.error(`Invalid file for ${key}`);
          return;
        }
      }

      setUploadedUrls(uploadResults); // Save URLs for preview

      try {
        const response = await axiosPublic.put(`/edit-policy-pdfs/${pdfId}`, uploadResults);
        if (response?.data?.modifiedCount > 0) {
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
                      PDFs changes correctly
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      PDFs has been updated successfully!
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
          toast.error("No changes detected!")
        }
      } catch (error) {
        toast.error('Failed to edit pdfs. Please try again!');
      }

    }

  };

  if (isPolicyPagesPending) {
    return <Loading />
  };

  return (
    <div className='w-full min-h-[calc(100vh-60px)] bg-gray-50 relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[58px]'
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
        className='absolute inset-0 z-0 top-2 md:top-16 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='max-w-screen-md mx-auto relative'>
        <h1 className='pt-6 text-neutral-800 font-bold text-xl md:text-2xl'>Upload Required Policy Documents</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pt-6">

          <div className='flex flex-col gap-6 w-full bg-white p-8 rounded-lg shadow relative'>
            {policyLabels.map(({ key, label }) => (
              <div key={key} className='relative'>
                <label className="block font-semibold text-neutral-700 pb-1 text-sm">{label}</label>

                <div onClick={() => fileInputRefs.current[key]?.click()} className="flex items-center border border-dashed border-gray-300 rounded-md bg-white shadow-sm p-2 cursor-pointer">

                  <span
                    htmlFor={key}
                    className="px-4 py-2 text-sm text-neutral-700 bg-[#d4ffce] hover:bg-[#bdf6b4] rounded-md cursor-pointer transition-[background-color] duration-300 font-bold"
                  >
                    Choose File
                  </span>

                  <span className="ml-4 text-gray-600 truncate flex-1">
                    {files[key]?.name || "No file chosen"}
                  </span>

                  {/* Cross icon inside input box */}
                  {(files[key] || uploadedUrls[key]) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering file input
                        handleClearFile(key);
                      }}
                      className="text-red-600 hover:text-red-800 text-lg absolute right-2"
                    >
                      <RxCross2 />
                    </button>
                  )}

                  <input
                    id={key}
                    ref={(el) => (fileInputRefs.current[key] = el)}
                    type="file"
                    accept=".pdf"
                    className="hidden absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, key)}
                  />

                </div>

                <div className='flex pt-2'>

                  {uploadedUrls[key] && (
                    <a
                      href={uploadedUrls[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:underline text-sm whitespace-nowrap"
                    >
                      Preview
                    </a>
                  )}
                </div>

                {/* Error message */}
                {errors[key] && (
                  <p className="text-xs font-semibold text-red-500">{errors[key]}</p>
                )}

              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              className="my-8 bg-[#ffddc2] hover:bg-[#fbcfb0] text-neutral-700 cursor-pointer font-bold gap-x-2 rounded-lg px-[15px] py-2 transition-[background-color] duration-300 ease-in-out text-sm"
            >
              Confirm & Continue
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default PolicyPages;