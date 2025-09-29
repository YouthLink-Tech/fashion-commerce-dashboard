"use client";
import FinancePerformance from '@/app/components/finances/FinancePerformance';
import FinanceTable from '@/app/components/finances/FinanceTable';
import RefundedPayments from '@/app/components/finances/RefundedPayments';
import React, { useEffect, useState } from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import PaymentMethods from './payment-methods/page';
import Expenses from '@/app/components/finances/expenses/Expenses';

const Finances = () => {

  const [activeTab, setActiveTab] = useState('completed');

  // Ensure the code runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTabFinancesPage');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTabFinancesPage', activeTab);
    }
  }, [activeTab]);

  return (
    <div className='px-6 md:px-10 bg-gray-50 relative min-h-screen'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[70px]'
      />

      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center top-96 xl:top-28 w-full bg-no-repeat'
      />

      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-36 md:top-36 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[20%] lg:bg-[length:200px_100px] md:left-[0%] xl:left-[10%] 2xl:left-[25%] bg-no-repeat'
      />

      <div className="bg-gray-50 sticky top-0 z-10">
        <h1 className="font-bold text-lg md:text-xl lg:text-3xl text-neutral-700 py-1 2xl:py-3 bg-gray-50">FINANCES</h1>

        <div className="flex items-center gap-3 bg-gray-50">

          <button
            className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'completed' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'completed' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>

          <button
            className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'refunded' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'refunded' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
      `}
            onClick={() => setActiveTab('refunded')}
          >
            Refunded
          </button>

          <button className={`relative text-sm py-1 transition-all duration-300 ${activeTab === 'payment methods' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'} after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300 ${activeTab === 'payment methods' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('payment methods')}>
            Payment methods
          </button>

          <button className={`relative text-sm py-1 transition-all duration-300 ${activeTab === 'expenses' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'} after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300 ${activeTab === 'expenses' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            onClick={() => setActiveTab('expenses')}>
            Expenses
          </button>

        </div>
      </div>

      {activeTab === "completed" && <div className='pt-4'>
        <h1 className='font-bold'>Performance</h1>
        <p className='pt-1 text-neutral-400 text-sm font-medium'>The data includes all Pending, Paid, Canceled, or Refunded transactions.</p>
        <FinancePerformance />
      </div>}

      {activeTab === "refunded" && <div className='pt-4'>
        <h1 className='font-bold'>Performance</h1>
        <p className='pt-1 text-neutral-400 text-sm font-medium'>The data includes all Pending, Paid, Canceled, or Refunded transactions.</p>
        <RefundedPayments />
      </div>}

      {activeTab === "payment methods" && <div className='pt-4'>
        <h1 className='font-bold'>Payment Methods</h1>
        <p className='pt-1 text-neutral-400 text-sm font-medium'>The data includes all payment methods.</p>
        <PaymentMethods />
      </div>}

      {activeTab === "expenses" && <div className='pt-4'>
        <h1 className='font-bold'>Expenses</h1>
        <p className='pt-1 text-neutral-400 text-sm font-medium'>The data includes all expenses.</p>
        <Expenses />
      </div>}

      <div className='mt-12 md:mt-16'>
        <h1 className='font-bold'>Recent Transactions</h1>
        <p className='pt-1 pb-6 text-neutral-400 text-sm font-medium'>Please use the following table to view your transactions.</p>
        <FinanceTable />
      </div>

    </div >
  );
};

export default Finances;