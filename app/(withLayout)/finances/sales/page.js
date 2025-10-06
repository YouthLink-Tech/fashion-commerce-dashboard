import FinancePerformance from '@/app/components/finances/FinancePerformance';
import FinanceTable from '@/app/components/finances/FinanceTable';
import RefundedPayments from '@/app/components/finances/RefundedPayments';
import React from 'react';

const FinancesSales = () => {
  return (
    <div className='bg-gray-50 relative mx-auto px-6 pb-4'>

      <div className='flex-1 w-full mb-6'>
        <h3 className='text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-800'>Sales</h3>
        <p className='pt-2 text-start font-semibold text-sm text-neutral-500'>Monitor your total orders, revenue, and refunds with real-time analytics, detailed graphs, and recent transaction insights.</p>
      </div>

      <FinancePerformance />
      <RefundedPayments />
      <div>
        <h1 className='font-bold'>Recent Transactions</h1>
        <p className='pt-1 pb-6 text-neutral-400 text-sm font-medium'>Please use the following table to view your transactions.</p>
        <FinanceTable />
      </div>
    </div>
  );
};

export default FinancesSales;