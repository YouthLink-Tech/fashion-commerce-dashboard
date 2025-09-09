"use client";
import useAnalyticsProfitability from '@/app/hooks/useAnalyticsProfitability';
import React from 'react';
import AnalyticsCard from '../shared/Loading/AnalyticsCard';
import { CiPercent } from 'react-icons/ci';

const GrossMargin = () => {

  const [analyticsProfitability, isAnalyticsProfitabilityPending] = useAnalyticsProfitability();

  if (isAnalyticsProfitabilityPending) return <AnalyticsCard />;

  return (
    <div className='border p-8 rounded-lg bg-white'>
      <div className='flex justify-start items-center gap-2 mb-4'>
        <p className='inline-flex items-center justify-center border rounded-full p-2 bg-gray-200'>
          <CiPercent size={22} />
        </p>
        <h1 className='font-semibold text-neutral-700 text-2xl'>Gross Margin</h1>
      </div>
      <h4 className='font-semibold text-3xl text-neutral-800'>৳ {analyticsProfitability?.grossMarginPercent} %</h4>
    </div>
  );
};

export default GrossMargin;