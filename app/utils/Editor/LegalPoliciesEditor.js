import dynamic from 'next/dynamic';
import React, { useRef, useMemo, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';

// Dynamically load ReactQuill
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    const ForwardedReactQuill = ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
    ForwardedReactQuill.displayName = 'ReactQuill'; // Assign display name here
    return ForwardedReactQuill;
  },
  { ssr: false }
);

export default function LegalPoliciesEditor({ value, onChange }) {
  const quillRef = useRef();

  // imgbb API key
  const imgbbApiKey = '54b5f65b4f81c5ddfc0f32e2581e8e62';
  const imgbbApiUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);

      // Save current cursor position
      const range = quillRef.current.editor.getSelection(true);

      // Insert temporary loading image (optional)
      quillRef.current.editor.insertEmbed(range.index, 'image', `${window.location.origin}/images/loaders/placeholder.gif`);
      quillRef.current.editor.setSelection(range.index + 1);

      try {
        // Upload image to imgbb
        const response = await fetch(imgbbApiUrl, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          const imageUrl = data.data.url;

          // Remove placeholder and insert the actual image
          quillRef.current.editor.deleteText(range.index, 1);
          quillRef.current.editor.insertEmbed(range.index, 'image', imageUrl);
          quillRef.current.editor.setSelection(range.index + 1); // Move cursor to right of the image
        } else {
          console.error("Failed to upload image:", data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
  }, [imgbbApiUrl]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        [{ 'list': 'bullet' }],
        ['link', 'image'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  return (
    <div className='custom-editor-legal-policies'>
      <ReactQuill
        forwardedRef={quillRef}
        modules={modules}
        value={value}
        onChange={onChange} // Use the provided onChange from props
      />
    </div>
  );
};