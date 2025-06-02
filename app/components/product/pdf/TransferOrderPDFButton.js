"use client";
import React, { useState, useEffect } from "react";
import { BsFiletypePdf } from "react-icons/bs";
import TransferOrderPDF from "./TransferOrderPDF";

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
  const [pdfModule, setPdfModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Dynamically import @react-pdf/renderer for client-side rendering
    import("@react-pdf/renderer")
      .then((module) => {
        setPdfModule(module); // Store the dynamically imported module
      })
      .catch((error) => {
        console.error("Failed to load @react-pdf/renderer:", error);
      });
  }, []);

  const handlePdfClick = async () => {
    if (!pdfModule) {
      console.error("PDF module not loaded yet.");
      return;
    }

    setIsLoading(true); // Show loading state

    try {
      const { pdf } = pdfModule; // Use the dynamically imported pdf function
      const blob = await pdf(
        <TransferOrderPDF
          data={{
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
          }}
        />
      ).toBlob();

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank"); // Open PDF in a new tab
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false); // Hide loading state
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