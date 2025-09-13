import React from 'react';
import { CiPercent } from 'react-icons/ci';
import AnalyticsCard from '../../shared/Loading/AnalyticsCard';

const GrossMargin = ({ grossMarginPercent, loading, error }) => {

  if (loading || grossMarginPercent === null || grossMarginPercent === undefined) return <AnalyticsCard />;

  if (error) {
    return (
      <div className="h-80 flex justify-center items-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  };

  return (
    <div className='border p-8 rounded-lg bg-white'>
      <div className='flex justify-start items-center gap-2 mb-4'>
        <p className='inline-flex items-center justify-center border rounded-full p-2 bg-gray-200'>
          <CiPercent strokeWidth={1} className="text-gray-700" size={22} />
        </p>
        <h1 className='font-semibold text-neutral-700 text-2xl'>Gross Margin</h1>
      </div>
      <h4 className='font-semibold text-3xl text-neutral-800'>{grossMarginPercent} %</h4>
    </div>
  );
};

export default GrossMargin;