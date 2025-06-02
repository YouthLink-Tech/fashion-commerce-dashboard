import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CustomPagination = ({ totalPages, currentPage, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxButtons = 5; // Maximum number of buttons to show

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base ${i === currentPage + 1 ? "bg-[#ffddc2] font-semibold text-neutral-700" : "text-gray-800"} hover:bg-[#fbcfb0] hover:text-neutral-800 transition duration-300`}
            onClick={() => onPageChange(i - 1)}
          >
            {i}
          </button>
        );
      }
    } else {
      const start = Math.max(0, currentPage - 1);
      const end = Math.min(totalPages, currentPage + 3);

      if (start > 1) {
        pageNumbers.push(
          <button
            key={1}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base ${currentPage === 0 ? "bg-[#ffddc2] font-semibold text-neutral-700" : "text-gray-800"} hover:bg-[#fbcfb0] hover:text-neutral-800 transition duration-300`}
            onClick={() => onPageChange(0)}
          >
            1
          </button>
        );

        if (start > 2) {
          pageNumbers.push(
            <button
              key="dots-start"
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base text-gray-800 disabled cursor-not-allowed"
              disabled
            >
              ...
            </button>
          );
        }
      }

      for (let i = start + 1; i <= end; i++) {
        pageNumbers.push(
          <button
            key={i}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base ${i === currentPage + 1 ? "bg-[#ffddc2] font-semibold text-neutral-700" : "text-gray-800"} hover:bg-[#fbcfb0] hover:text-neutral-800 transition duration-300`}
            onClick={() => onPageChange(i - 1)}
          >
            {i}
          </button>
        );
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageNumbers.push(
            <button
              key="dots-end"
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base text-gray-800 disabled cursor-not-allowed"
              disabled
            >
              ...
            </button>
          );
        }

        pageNumbers.push(
          <button
            key={totalPages}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow text-sm md:text-base ${currentPage === totalPages - 1 ? "bg-[#ffddc2] font-semibold text-neutral-700" : "text-gray-800"} hover:bg-[#fbcfb0] hover:text-neutral-800 transition duration-300`}
            onClick={() => onPageChange(totalPages - 1)}
          >
            {totalPages}
          </button>
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center">
      {/* Previous Button */}
      <button
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow bg-gray-50 ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"} 
        transition duration-300`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <FaChevronLeft />
      </button>

      {/* Page Numbers */}
      {renderPageNumbers()}

      {/* Next Button */}
      <button
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-large drop-shadow bg-gray-50 ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"} transition duration-300`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default CustomPagination;