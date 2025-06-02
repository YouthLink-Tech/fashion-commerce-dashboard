"use client";
import { useState, useEffect } from 'react';
import PDFDocument from '../orders/PDFDocument';

const CustomerPrintButton = ({ selectedOrder }) => {
  const [pdfModule, setPdfModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Dynamically import @react-pdf/renderer for client-side rendering only
    import('@react-pdf/renderer').then((module) => {
      setPdfModule(module); // Store the pdf module for later use
    }).catch((error) => {
      console.error("Failed to load @react-pdf/renderer:", error);
    });
  }, []);

  const handlePreview = async () => {
    if (!selectedOrder || !pdfModule) return;

    setIsLoading(true); // Show loading state

    try {
      const { pdf } = pdfModule; // Use the dynamically imported pdf function
      const blob = await pdf(<PDFDocument order={selectedOrder} />).toBlob();
      const pdfURL = URL.createObjectURL(blob);
      const printWindow = window.open(pdfURL, '_blank'); // Opens the PDF in a new tab

      // Automatically trigger print dialog
      printWindow.onload = function () {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print(); // Trigger the print dialog
        }, 100); // Delay the print command
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <span
      className="text-sm font-mono cursor-pointer text-blue-600 hover:text-blue-800"
      onClick={handlePreview}
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
    >
      {isLoading ? 'Generating...' : selectedOrder?.orderNumber}
    </span>
  );
};

export default CustomerPrintButton;