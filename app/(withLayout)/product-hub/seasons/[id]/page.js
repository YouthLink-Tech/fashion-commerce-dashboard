"use client";
import Loading from '@/app/components/shared/Loading/Loading';
import UploadUi from '@/app/components/upload-image/UploadUi';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { RxCheck, RxCross2 } from 'react-icons/rx';

export default function EditSeason() {
  const router = useRouter();
  const params = useParams();
  const axiosSecure = useAxiosSecure();
  const [image, setImage] = useState(null);
  const { data: session, status } = useSession();
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!params.id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchSeason = async () => {
      try {
        const res = await axiosSecure.get(`/api/season/single/${params.id}`);
        const season = res.data;
        setValue('seasonName', season?.seasonName);
        setImage(season?.imageUrl || null);
      } catch (error) {
        // console.error('Error fetching season:', error);
        // toast.error('Error fetching season data.');
        router.push('/product-hub/seasons');
      }
    };
    fetchSeason();
  }, [params.id, axiosSecure, setValue, session?.user?.accessToken, status, router]);

  const uploadSingleFileToGCS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await axiosSecure.post('/api/gcs-file-upload/upload-single-file', formData, {
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

  const handleUploadSuccess = (url) => {
    setImage(url);
  };

  const handleImageRemove = () => {
    setImage(null);
    document.getElementById('imageUpload').value = ''; // Clear the file input
  };

  const onSubmit = async (data) => {
    try {

      const fallbackImageUrl = "https://storage.googleapis.com/fashion-commerce-pdf/1748156001971_season_2964502.png";

      const updatedSeason = {
        seasonName: data?.seasonName,
        imageUrl: image || fallbackImageUrl,
      };

      const res = await axiosSecure.put(`/api/season/edit/${params.id}`, updatedSeason);
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

  if (status === "loading") return <Loading />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='bg-gray-50'>

      <div className='max-w-screen-lg mx-auto pt-3 md:pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <h3 className='w-full font-semibold text-lg lg:text-2xl text-neutral-600'>EDIT SEASON DETAILS</h3>
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={"/product-hub/seasons"}> <span className='border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2'><FaArrowLeft /></span> Go Back</Link>
        </div>
      </div>

      <div className='max-w-screen-lg mx-auto p-6 flex flex-col gap-4'>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

          {/* Season Name Field */}
          <div>
            <label htmlFor='seasonName' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Season <span className="text-red-600 pl-1">*</span></label>
            <input
              type="text"
              placeholder="Add Season Name"
              {...register('seasonName', { required: 'Season is required' })}
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              disabled
            />
            {errors.seasonName && (
              <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.seasonName.message}</p>
            )}
          </div>

        </div>

        <div className='flex flex-col gap-4 bg-[#ffffff] drop-shadow p-5 md:p-7 rounded-lg w-full'>

          <div>
            <div>
              <label htmlFor={`imageUpload`} className="flex justify-start font-semibold text-neutral-500 pb-2 text-sm">
                Season Thumbnail
              </label>
              <UploadUi
                dragging={dragging}
                setDragging={setDragging}
                imageError={imageError}
                setImageError={setImageError}
                onUploadSuccess={handleUploadSuccess}
                uploadFile={uploadSingleFileToGCS}
              />
            </div>

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