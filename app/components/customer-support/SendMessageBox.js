'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Controller, useForm } from 'react-hook-form';
import DOMPurify from "dompurify";

const SendMessageEditor = dynamic(() => import('@/app/utils/Editor/SendMessageEditor'), { ssr: false });

const SendMessageBox = ({ onSend }) => {
  const { handleSubmit, control, reset, formState: { errors } } = useForm();
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (data) => {
    onSend(data); // parent handles sending
    reset();
  };

  const handleCancel = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-4 hover:bg-gray-50 text-blue-600 font-medium"
        >
          ✉️ Send Message
        </button>
      ) : (
        <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>

          <div>
            <Controller
              name="supportReplyHtml"
              defaultValue=""
              rules={{
                required: "Support Reply is required.",
                validate: (value) => {
                  const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                  return strippedText.length >= 20 || "Support Reply must be at least 20 characters.";
                },
              }}
              control={control}
              render={({ field }) => <SendMessageEditor
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />}
            />
            {errors.supportReplyHtml && (
              <p className="text-red-600 text-left text-sm pt-1">{errors.supportReplyHtml.message}</p>
            )}
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              type='submit'
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className="px-4 py-2 rounded text-gray-600 hover:text-black hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

        </form>
      )}
    </div>
  );
};

export default SendMessageBox;