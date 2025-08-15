import React from 'react';

const HeadingText = ({ orderStatus }) => {

  const statusTextMap = {
    ordered: "Ordered products",
    received: "Received products",
    canceled: "Canceled products",
    pending: "Edit products"
  };

  const displayText = statusTextMap[orderStatus] || "Products";

  return (
    <span>{displayText}</span>
  );
};

export default HeadingText;