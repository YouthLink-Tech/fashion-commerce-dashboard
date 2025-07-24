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