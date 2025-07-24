import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { FcFile, FcImageFile, FcVideoFile } from "react-icons/fc";

export const extractVisibleMessage = (html) => {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove Gmail's quoted history
  const quote = doc.querySelector(".gmail_quote");
  if (quote) quote.remove();

  return doc.body.innerHTML;
};

export const getInitialPreviewTextFromCustomer = (text = "", wordLimit = 20) => {
  const words = text.trim().split(/\s+/);
  const isTruncated = words.length > wordLimit;
  const preview = words.slice(0, wordLimit).join(" ") + (isTruncated ? "..." : "");
  return { preview, isTruncated };
};

// export const getLastReplyPreview = (replies = [], charLimit = 30) => {
//   if (!replies?.length) return null;

//   const lastReply = replies[replies.length - 1];
//   const from = lastReply?.from === "support" ? "You" : "Customer";

//   const cleanHtml = extractVisibleMessage(lastReply?.html || "");

//   const div = document.createElement("div");
//   div.innerHTML = cleanHtml;
//   const text = (div.textContent || div.innerText || "").trim();

//   const isTruncated = text.length > charLimit;
//   const preview = text.slice(0, charLimit) + (isTruncated ? "..." : "");

//   return `${from}: ${preview}`;
// };

export const getPreviewText = (html = "", wordLimit = 20) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  const words = text.trim().split(/\s+/);
  const isTruncated = words.length > wordLimit;
  const preview = words.slice(0, wordLimit).join(" ") + (isTruncated ? "..." : "");
  return { preview, isTruncated };
};

// Utility to format file size (e.g., "46.8 KB")
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Utility to format content type (e.g., "image/png" -> "Image")
export const formatContentType = (contentType) => {
  if (!contentType) return 'File';
  if (contentType.startsWith('image/')) return 'Image';
  if (contentType === 'application/pdf') return 'PDF';
  if (contentType.includes('text/')) return 'Text';
  if (contentType.includes('application/')) return contentType.split('/')[1].toUpperCase();
  return 'File';
};

export const getIcon = (contentType) => {
  if (contentType.includes('image')) {
    return (
      <span className=''>
        <FcImageFile size={24} />
      </span>
    );
  } else if (contentType.includes('pdf')) {
    return (
      <span className='text-red-600'>
        <BsFileEarmarkPdfFill size={24} />
      </span>
    );
  } else if (contentType.includes('video')) {
    return (
      <span className=''>
        <FcVideoFile size={24} />
      </span>
    );
  } else {
    // Generic file icon for other types
    return (
      <span className=''>
        <FcFile size={24} />
      </span>
    );
  }
};