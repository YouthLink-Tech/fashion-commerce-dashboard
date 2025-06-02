"use client";
import { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { PiDownloadBold } from 'react-icons/pi';
import PDFDocument from './PDFDocument';

const PrintButton = ({ selectedOrder }) => {
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
    <Button
      color="primary"
      size="sm"
      onClick={handlePreview}
      isLoading={isLoading}
    >
      {isLoading ? 'Generating...' : 'Download Invoice'} <PiDownloadBold size={18} />
    </Button>
  );
};

export default PrintButton;