import React, { useState } from 'react';

const Progressbar = ({ accepted, rejected, total, width = 'w-full' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const totalQuantity = total || 0;
  const acceptedQuantity = Math.min(accepted, totalQuantity);
  const rejectedQuantity = Math.min(rejected, totalQuantity);

  const acceptedPercentage = totalQuantity > 0 ? (acceptedQuantity / totalQuantity) * 100 : 0;
  const rejectedPercentage = totalQuantity > 0 ? (rejectedQuantity / totalQuantity) * 100 : 0;

  return (
    <div
      className={`relative ${width} bg-gray-200 rounded-full h-4 overflow-visible`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 p-2 bg-gray-800 text-white text-[10px] font-semibold rounded-md shadow-lg z-50 transition-opacity duration-300 opacity-100">
          <div className="flex items-center gap-1 justify-center">
            <span className='flex items-center gap-0.5'><span>✅</span> Accepted:</span>
            <span>{acceptedQuantity}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className='flex items-center gap-0.5'><span>❌</span> Rejected:</span>
            <span>{rejectedQuantity}</span>
          </div>
          <div className="tooltip-arrow bg-gray-800"></div>
        </div>
      )}

      <div
        className="bg-[#bdf6b4] h-full rounded-full"
        style={{ width: `${acceptedPercentage}%` }}
      />
    </div>
  );
};

export default Progressbar;
