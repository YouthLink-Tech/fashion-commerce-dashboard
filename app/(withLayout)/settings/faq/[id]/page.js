"use client";
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { FaArrowLeft, FaPlus } from 'react-icons/fa6';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import LegalPoliciesEditor from '@/app/utils/Editor/LegalPoliciesEditor';
import { FiSave } from 'react-icons/fi';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { RiDeleteBinLine } from "react-icons/ri";
import EditorFAQ from '@/app/utils/Editor/EditorFAQ';
import DOMPurify from "dompurify";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import Loading from '@/app/components/shared/Loading/Loading';

const EditFAQPage = () => {

  const { id } = useParams();
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { faqs: [{ question: "", answer: "" }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchFAQDetails = async () => {
      try {
        const { data } = await axiosSecure.get(`/api/faq/single/${id}`);

        setValue('pageTitle', data?.pageTitle);
        setValue('faqDescription', data?.faqDescription);

        if (data?.faqs?.length > 0) {
          setValue('faqs', data.faqs);
        }

      } catch (error) {
        // toast.error("Failed to load FAQ details.");
        router.push("/settings/faq");
      }
    };

    fetchFAQDetails();
  }, [id, setValue, axiosSecure, session?.user?.accessToken, status, router]);

  const onSubmit = async (data) => {

    try {

      // Filter out empty FAQs
      const validFaqs = data?.faqs?.filter(faq => faq?.question.trim() !== "" && faq?.answer.trim() !== "");

      if (validFaqs.length === 0) {
        toast.error("Please add at least one FAQ before submitting");
        return;
      }

      const faqData = {
        pageTitle: data?.pageTitle,
        faqDescription: data?.faqDescription,
        faqs: data?.faqs
      }

      const res = await axiosSecure.put(`/api/faq/edit/${id}`, faqData);
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
                    FAQ Updated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    FAQ has been updated successfully!
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
        reset();
        router.push("/settings/faq");
      } else {
        toast.error('No changes detected!');
      }

    }
    catch (error) {
      toast.error('Failed to update faqs. Please try again!');
    }

  };

  if (status === "loading") return <Loading />;

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative px-6'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat xl:left-[15%] 2xl:left-[30%] bg-[length:1600px_900px]'
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
        className='absolute inset-0 z-0 top-16 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[50%] bg-no-repeat'
      />

      <div className='max-w-screen-xl mx-auto py-3 md:py-6 sticky top-0 z-10 bg-gray-50'>
        <div className='flex items-center justify-between px-8 gap-4'>

          <h3 className='flex-1 font-semibold text-lg lg:text-2xl text-neutral-600'>Edit FAQ</h3>

          <div className='flex justify-start'>
            <button type="button" onClick={() => append({ question: "", answer: "" })} className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700'>
              Add <FaPlus size={16} />
            </button>
          </div>

          <Link // Trigger the modal on click
            className="flex items-center gap-2 text-[10px] md:text-base justify-end"
            href="/settings/faq">
            <span className="border border-black hover:scale-105 duration-300 rounded-full p-1 md:p-2">
              <FaArrowLeft />
            </span>
            Go Back
          </Link>

        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="2xl:max-w-screen-xl 2xl:mx-auto relative flex flex-col gap-8">

        <div className='flex flex-col gap-8 items-center bg-white p-4 lg:p-8 drop-shadow rounded-lg'>

          <div className="relative w-full">
            <label htmlFor='pageTitle' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Page Title <span className="text-red-600 pl-1">*</span></label>
            <input
              id="pageTitle"
              type="text"
              className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px] font-semibold"
              placeholder="Enter page title"
              {...register("pageTitle", {
                required: {
                  value: true,
                  message: "Page Title is required.",
                },
                minLength: {
                  value: 6,
                  message: "Page Title must be at least 6 characters.",
                },
                maxLength: {
                  value: 70,
                  message: "Page Title cannot exceed 70 characters.",
                },
              })}
            />
            {errors.pageTitle && (
              <p className="text-left pt-2 text-red-500 font-semibold text-xs">
                {errors.pageTitle?.message}
              </p>
            )}
          </div>

          <div className='flex flex-col rounded-lg h-fit w-full'>
            <label htmlFor='faqDescription' className="flex justify-start font-semibold text-neutral-500 text-sm pb-2">Details About FAQ <span className="text-red-600 pl-1">*</span></label>
            <Controller
              name="faqDescription"
              defaultValue=""
              rules={{
                required: "FAQ Description is required",
                validate: (value) => {
                  const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                  return strippedText.length >= 10 || "FAQ Description must be at least 10 characters.";
                },
              }}
              control={control}
              render={({ field }) => <LegalPoliciesEditor
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />}
            />
            {errors.faqDescription && (
              <p className="text-left pt-2 text-red-500 font-semibold text-xs">{errors.faqDescription.message}</p>
            )}
          </div>

        </div>

        <div className='grid grid-cols-1 gap-4 w-full'>
          <h3 className='font-semibold text-neutral-600 px-8 text-base lg:text-lg'>Question & Answers</h3>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
            {fields.map((faq, index) => (
              <div key={faq.id} className="bg-white p-4 lg:p-8 drop-shadow rounded-lg h-fit">

                <div className="relative w-full">
                  <input
                    type="text"
                    className="w-full border-b-2 border-neutral-300 bg-transparent py-2 text-neutral-800 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-neutral-400 text-sm"
                    placeholder="Enter question"
                    {...register(`faqs.${index}.question`, {
                      required: {
                        value: true,
                        message: "Question is required.",
                      },
                      minLength: {
                        value: 5,
                        message: "Question must have at least 5 characters.",
                      },
                    })}
                  />
                  {errors.faqs?.[index]?.question && (
                    <p className="absolute -bottom-5 left-0 text-xs font-semibold text-red-500">
                      {errors.faqs[index].question.message}
                    </p>
                  )}
                </div>

                <div className={`flex flex-col gap-2 rounded-lg h-fit pt-8`}>
                  <Controller
                    name={`faqs.${index}.answer`}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Answer is required.",
                      validate: (value) => {
                        const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                        return strippedText.length >= 10 || "Answer must be at least 10 characters.";
                      },
                    }}
                    render={({ field }) => (
                      <EditorFAQ
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />
                  {errors.faqs?.[index]?.answer && (
                    <p className="left-0 text-xs font-semibold text-red-500">
                      {errors.faqs[index].answer.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end pt-2'>
                  <p type="button" className='cursor-pointer hover:bg-gray-50 p-3 rounded-full' onClick={() => remove(index)}><RiDeleteBinLine size={20} /></p>
                </div>

              </div>
            ))}
          </div>

        </div>

        <div className='flex justify-end w-full py-8'>
          <button type="submit" className='relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[16px] py-3 transition-[background-color] duration-300 ease-in-out hover:bg-[#bdf6b4] font-bold text-[14px] text-neutral-700'>
            Save <FiSave size={19} />
          </button>
        </div>

      </form>

    </div>
  );
};

export default EditFAQPage;