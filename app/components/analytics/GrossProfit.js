"use client";
import useAnalyticsProfitability from '@/app/hooks/useAnalyticsProfitability';
import React from 'react';
import AnalyticsCard from '../shared/Loading/AnalyticsCard';
import { BsGraphUpArrow } from "react-icons/bs";

const GrossProfit = () => {

  const [analyticsProfitability, isAnalyticsProfitabilityPending] = useAnalyticsProfitability();

  if (isAnalyticsProfitabilityPending) return <AnalyticsCard />;

  return (
    <div className='border p-8 rounded-lg bg-white'>
      <div className='flex justify-start items-center gap-2 mb-4'>
        <p className='inline-flex items-center justify-center border rounded-full p-3 bg-gray-200'>
          <BsGraphUpArrow size={16} />
        </p>
        <h1 className='font-semibold text-neutral-700 text-2xl'>Gross Profit</h1>
      </div>
      <h4 className='font-semibold text-3xl text-neutral-800'>৳ {analyticsProfitability?.grossProfit}</h4>
    </div>
  );
};

export default GrossProfit;