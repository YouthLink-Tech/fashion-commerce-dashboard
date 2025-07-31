import React from 'react';

const TopFooterWrapper = ({ position, children }) => {
  return (
    <div className="relative bg-[#ebfeeb]">
      <div
        className={`flex items-center justify-evenly overflow-hidden px-5 py-14 sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0 ${position !== "center" ? "gap-5 py-[72px]" : "flex-col gap-12 py-14"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default TopFooterWrapper;