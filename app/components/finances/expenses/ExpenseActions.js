import { useRouter } from 'next/navigation';
import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ExpenseActions = () => {

  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row mt-6 justify-between items-end lg:items-center gap-3 w-full">

      <div className='flex-1 w-full mb-6'>
        <h3 className='text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-800'>Expense Categories</h3>
        <p className='pt-2 text-start font-semibold text-sm text-neutral-500'>View and manage all expense categories. Click on a category to see its related expense entries or add new ones directly.</p>
      </div>

      <div className="flex-1 flex items-center justify-end gap-2">

        <button onClick={() => router.push('/finances/expenses/add-expense-entry')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] hover:bg-[#bdf6b4] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out font-semibold text-[12px] lg:text-[14px] text-neutral-700">
          <FaPlus size={15} className='text-neutral-700' /> Expense Entry
        </button>

        <button onClick={() => router.push('/finances/expenses/add-expense-category')} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-semibold text-[12px] lg:text-[14px] text-neutral-700">
          <FaPlus size={15} className='text-neutral-700' /> Expense Category
        </button>

      </div>

    </div>
  );
};

export default ExpenseActions;