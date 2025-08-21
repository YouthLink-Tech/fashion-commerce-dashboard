import React from 'react';
import NotificationLoading from '../../shared/Loading/NotificationLoading';

const DashboardWrapperLoading = () => {
  return (
    <div>
      <div className="h-screen w-[262px] fixed z-50 overflow-y-auto bg-white p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="border-t my-4 border-gray-300" />
        <h1 className="px-4 text-neutral-500 mb-4 font-medium">MAIN MENU</h1>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-[80%] mx-auto" />
        ))}
        <div className="border-t my-4 border-gray-300" />
        <h1 className="px-4 text-neutral-500 mt-8 mb-4  font-medium">OTHERS</h1>
        {[...Array(1)].map((_, i) => (
          <div key={`s-${i}`} className="h-8 bg-gray-200 rounded w-[60%] mx-auto" />
        ))}
      </div>
      <div className="w-full bg-gray-50 flex justify-center items-center p-4 min-h-[60px]">
        <div className="px-8 flex items-center justify-between w-full">
          <div className="w-full"></div>
          <div className="flex items-center justify-end gap-4 w-full">
            <NotificationLoading />
            <NotificationLoading />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWrapperLoading;