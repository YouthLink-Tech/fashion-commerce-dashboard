import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import default styles

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const OurStoryEditor = ({ value, onChange }) => {

  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        ['link'],
      ],
    },
  };

  return (
    <div className="custom-editor-our-story">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
};

export default OurStoryEditor;