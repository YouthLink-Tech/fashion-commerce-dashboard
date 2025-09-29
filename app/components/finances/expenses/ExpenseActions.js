import { useRouter } from 'next/navigation';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ExpenseActions = () => {

  const router = useRouter();

  return (
    <div className="flex flex-wrap mt-6 justify-center lg:justify-end items-center gap-3">
      <div className="flex items-center justify-center gap-2">

        <button onClick={() => router.push('/finances/add-expense-entry')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] hover:bg-[#bdf6b4] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-semibold text-[12px] lg:text-[14px] text-neutral-700">
          <FaPlus size={15} className='text-neutral-700' /> Add Expense Entry
        </button>

        <button onClick={() => router.push('/finances/add-expense-category')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[12px] lg:text-[14px] text-neutral-700">
          <FaPlus size={15} className='text-neutral-700' /> Add Expense Category
        </button>

      </div>
    </div>
  );
};

export default ExpenseActions;