"use client";
import React, { useState } from "react";
import { BsFiletypePdf } from "react-icons/bs";

const TransferOrderPDFButton = ({
  transferOrderNumber,
  transferOrderStatus,
  selectedOrigin,
  selectedDestination,
  estimatedArrival,
  selectedProducts,
  transferOrderVariants,
  referenceNumber,
  supplierNote,
  trackingNumber,
  shippingCarrier,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // const handlePdfClick = async () => {
  //   if (!pdfModule) {
  //     console.error("PDF module not loaded yet.");
  //     return;
  //   }

  //   setIsLoading(true); // Show loading state

  //   try {
  //     const { pdf } = pdfModule; // Use the dynamically imported pdf function
  //     const blob = await pdf(
  //       <TransferOrderPDF
  //         data={{
  //           transferOrderNumber,
  //           transferOrderStatus,
  //           selectedOrigin,
  //           selectedDestination,
  //           estimatedArrival,
  //           selectedProducts,
  //           transferOrderVariants,
  //           referenceNumber,
  //           supplierNote,
  //           trackingNumber,
  //           shippingCarrier,
  //         }}
  //       />
  //     ).toBlob();

  //     const blobUrl = URL.createObjectURL(blob);
  //     window.open(blobUrl, "_blank"); // Open PDF in a new tab
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   } finally {
  //     setIsLoading(false); // Hide loading state
  //   }
  // };

  const handlePdfClick = async () => {
    setIsLoading(true);
    try {
      const payload = {
        transferOrderNumber,
        transferOrderStatus,
        selectedOrigin,
        selectedDestination,
        estimatedArrival,
        selectedProducts,
        transferOrderVariants,
        referenceNumber,
        supplierNote,
        trackingNumber,
        shippingCarrier,
      };
      // console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Log for debugging
      const response = await fetch('/api/generate-transfer-order-pdf', {
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

export default TransferOrderPDFButton;