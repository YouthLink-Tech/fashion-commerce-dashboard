import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import default styles

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const EditorFAQ = ({ value, onChange, placeholder = "Write your answer here..." }) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link'],
    ],
  };

  return (
    <div className="custom-editor-faq">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder} // ✅ Add placeholder here
      />
    </div>
  );
};

export default EditorFAQ;