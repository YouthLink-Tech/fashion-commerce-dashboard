import Link from 'next/link';
import React from 'react';

const ExpenseCard = ({ expenseCategoryList }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {expenseCategoryList?.map((category, idx) => (
        <div key={idx} className="p-6 border-none bg-white drop-shadow rounded-lg">

          <h2 className="font-bold text-lg">
            <Link
              href={`/finances/expenses/expense-entries/${encodeURIComponent(category._id)}`}
              className="text-blue-500 hover:underline">
              {category.expenseCategory}
            </Link>
          </h2>

        </div>
      ))}
    </div>
  );
};

export default ExpenseCard;