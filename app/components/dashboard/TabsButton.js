// components/TabButton.jsx
import React from 'react';

const TabsButton = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`relative text-sm py-1 transition-all duration-300
        ${isActive ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${isActive ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default TabsButton;