"use client";
import { isValidImageFile } from '@/app/components/shared/upload/isValidImageFile';
import useAxiosPublic from '@/app/hooks/useAxiosPublic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { MdOutlineFileUpload } from 'react-icons/md';
import { RxCheck, RxCross2 } from 'react-icons/rx';

export default function EditSeason() {
  const router = useRouter();
  const params = useParams();
  const axiosPublic = useAxiosPublic();
  const [image, setImage] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        const res = await axiosPublic.get(`/allSeasons/${params.id}`);
        const season = res.data;
        setValue('seasonName', season?.seasonName);
        setImage(season?.imageUrl || null);
      } catch (error) {
        console.error('Error fetching season:', error);
        toast.error('Error fetching season data.');
      }
    };
    fetchSeason();
  }, [params.id, axiosPublic, setValue]);

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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidImageFile(file)) return;

    // Immediately upload the selected image to Imgbb
    const uploadedImageUrl = await uploadSingleFileToGCS(file);

    if (uploadedImageUrl) {
      // Update the state with the Imgbb URL instead of the local blob URL
      setImage(uploadedImageUrl);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    document.getElementById('imageUpload').value = ''; // Clear the file input
  };

  const onSubmit = async (data) => {
    try {

      const updatedSeason = {
        seasonName: data?.seasonName,
        imageUrl: image
      };

      const res = await axiosPublic.put(`/editSeason/${params.id}`, updatedSeason);
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
                    Season Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Season has been updated successfully!
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
        router.push('/product-hub/seasons');
      } else {
        toast.error('No changes detected.');
      }
    } catch (error) {
      console.error('Error editing season:', error);
      toast.error('There was an error editing the season. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='bg-gray-50'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-xl lg:text-2xl'>EDIT SEASON DETAILS</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/seasons"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>
          {/* Season Name Field */}
          <div>
            <label className="flex justify-start font-medium text-[#9F5216] pb-2">Season *</label>
            <input
              type="text"
              placeholder="Add Season Name"
              {...register('seasonName', { required: 'Season is required' })}
              className="w-full p-3 border border-gray-300 outline-none focus:border-[#9F5216] transition-colors duration-1000 rounded-md"
            />
            {errors.seasonName && (
              <p className="text-red-600 text-left">{errors.seasonName.message}</p>
            )}
          </div>

        </div>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

          <div>
            <input
              id='imageUpload'
              type='file'
              className='hidden'
              onChange={handleImageChange}
            />
            <label
              htmlFor='imageUpload'
              className='mx-auto flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-gray-400 p-6 bg-white cursor-pointer'
            >
              <MdOutlineFileUpload size={60} />
              <div className='space-y-1.5 text-center'>
                <h5 className='whitespace-nowrap text-lg font-medium tracking-tight'>
                  Upload Thumbnail
                </h5>
                <p className='text-sm text-gray-500'>
                  Photo Should be in PNG, JPEG, JPG, WEBP or Avif format
                </p>
              </div>
            </label>

            {image && (
              <div className='relative'>
                <Image
                  src={image}
                  alt='Uploaded image'
                  height={2000}
                  width={2000}
                  className='w-1/2 mx-auto h-[350px] mt-8 rounded-lg object-contain'
                />
                <button
                  onClick={handleImageRemove}
                  className='absolute top-1 right-1 rounded-full p-1 bg-red-600 hover:bg-red-700 text-white font-bold'
                >
                  <RxCross2 size={24} />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Submit Button */}
        <div className='flex justify-end pt-4 pb-8'>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#ffddc2] hover:bg-[#fbcfb0]'} relative z-[1] flex items-center gap-x-3 rounded-lg  px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-bold text-[14px] text-neutral-700`}
          >
            {isSubmitting ? 'Save Changes...' : 'Saved'} <FiSave size={20} />
          </button>
        </div>

      </div>
    </form>
  );
}