"use client";
import React from 'react';

const TabsForSettings = ({ activeTab, setActiveTab, tabs }) => {

  return (
    <div className="flex flex-wrap items-center gap-3 bg-gray-50">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`relative text-sm py-1 transition-all duration-300 after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300 ${activeTab === tab ? "text-neutral-800 font-semibold" : "text-neutral-400 font-medium"} ${activeTab === tab ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabsForSettings;
