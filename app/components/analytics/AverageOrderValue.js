"use client";
import useAnalyticsSales from '@/app/hooks/useAnalyticsSales';
import React from 'react';
import { IoCartOutline } from "react-icons/io5";
import AnalyticsCard from '../shared/Loading/AnalyticsCard';

const AverageOrderValue = () => {

  const [analyticsSales, isAnalyticsSalesPending] = useAnalyticsSales();

  if (isAnalyticsSalesPending) return <AnalyticsCard />;

  return (
    <div className='border p-8 rounded-lg bg-white'>
      <div className='flex justify-start items-center gap-2 mb-4'>
        <p className='inline-flex items-center justify-center border rounded-full p-2 bg-gray-200'>
          <IoCartOutline size={22} />
        </p>
        <h1 className='font-semibold text-neutral-700 text-2xl'>AOV</h1>
      </div>
      <h4 className='font-semibold text-3xl text-neutral-800'>৳ {analyticsSales?.averageOrderValue}</h4>
    </div>
  );
};

export default AverageOrderValue;