"use client";
import useFAQ from '@/app/hooks/useFAQ';
import MarkdownRenderer from '@/app/utils/Markdown/MarkdownRenderer';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa6';

const FAQPage = () => {

  const router = useRouter();
  const [faqList] = useFAQ();

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)]'>

      <div className='px-6 max-w-screen-md mx-auto pb-6'>

        <div className='sticky top-0 z-10 bg-gray-50 flex items-center justify-between py-6'>

          <h1 className='font-semibold text-center text-lg md:text-xl lg:text-3xl text-neutral-700'>FAQ MANAGEMENT</h1>

          {faqList?.length > 0 ? (
            faqList.map((item) => (
              <button key={item._id} onClick={() => router.push(`/settings/faq/${item._id}`)}>
                <span className='flex items-center gap-1.5 rounded-md bg-neutral-100 p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-neutral-200 max-md:[&_p]:hidden max-md:[&_svg]:size-4'>
                  <AiOutlineEdit size={16} /> Edit
                </span>
              </button>
            ))
          ) : (
            <button onClick={() => router.push('/settings/faq/add-faq')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700">
              <FaPlus size={15} className='text-neutral-700' /> Add
            </button>
          )}

        </div>

        <div className=''>

          {faqList?.map((faqs) => (

            <div key={faqs?._id}>

              <p className="py-6">
                <h1 className='text-2xl pb-2'>{faqs?.pageTitle}</h1>
                <MarkdownRenderer content={faqs?.faqDescription} />
              </p>

              <Accordion className="flex flex-col w-full"
                showDivider={true}
                motionProps={{
                  variants: {
                    enter: { y: 0, opacity: 1, height: "auto", transition: { duration: 0.5 } },
                    exit: { y: -10, opacity: 0, height: 0, transition: { duration: 0.3 } },
                  },
                }} selectionMode="multiple">
                {faqs?.faqs?.map((faq, index) => {
                  return (
                    <AccordionItem
                      key={index}
                      aria-label={faq?.question}
                      title={faq?.question}
                      className="[&_h2>button_span]:font-normal [&_h2]:!my-2"
                    >
                      <MarkdownRenderer content={faq?.answer} />
                    </AccordionItem>
                  );
                })}
              </Accordion>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default FAQPage;