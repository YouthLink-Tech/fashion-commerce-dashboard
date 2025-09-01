"use client";
import React, { useState } from "react";
import { BsFiletypePdf } from "react-icons/bs";

const PurchaseOrderPDFButton = ({
  selectedVendor,
  selectedLocation,
  paymentTerms,
  estimatedArrival,
  referenceNumber,
  supplierNote,
  totalTax,
  totalPrice,
  totalQuantity,
  shipping,
  discount,
  total,
  selectedProducts,
  purchaseOrderVariants,
  purchaseOrderNumber,
  purchaseOrderStatus
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // In PurchaseOrderPDFButton.js
  const handlePdfClick = async () => {
    setIsLoading(true);
    try {
      const payload = {
        selectedVendor,
        selectedLocation,
        paymentTerms,
        estimatedArrival,
        referenceNumber,
        supplierNote,
        totalTax,
        totalPrice,
        totalQuantity,
        shipping,
        discount,
        total,
        selectedProducts,
        purchaseOrderVariants,
        purchaseOrderNumber,
        purchaseOrderStatus,
      };
      // console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Log for debugging
      const response = await fetch('/api/generate-purchase-order-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from server
        throw new Error(errorData.error || 'PDF generation failed');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Client-side error:', error.message); // Improved error logging
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePdfClick}
      className={`group relative inline-flex items-center justify-center w-[40px] h-[40px] ${isLoading ? "bg-gray-400" : "bg-[#D2016E]"
        } text-white rounded-full shadow-lg transform scale-100 transition-transform duration-300`}
      disabled={isLoading} // Disable button while loading
    >
      <BsFiletypePdf
        size={20}
        className={`rotate-0 transition ease-out duration-300 scale-100 ${isLoading ? "opacity-50" : "group-hover:-rotate-45 group-hover:scale-75"
          }`}
      />
    </button>
  );
};

export default PurchaseOrderPDFButton;