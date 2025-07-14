import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import default styles

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const SendMessageEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'bullet' }],
      ['link'],
    ],
  };

  return (
    <div className="custom-editor">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Write your message..."
      />
    </div>
  );
};

export default SendMessageEditor;