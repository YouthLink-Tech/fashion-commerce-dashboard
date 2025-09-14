import React from 'react';
import AnalyticsCard from '../../shared/Loading/AnalyticsCard';

const ConversionRate = ({ conversionRate, loading, error }) => {

  if (loading || conversionRate === null || conversionRate === undefined) return <AnalyticsCard />;

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
        <h1 className='font-semibold text-neutral-700 text-2xl'>Conversion Rate</h1>
      </div>
      <h4 className='font-semibold text-3xl text-neutral-800'>{conversionRate} %</h4>
    </div>
  );
};

export default ConversionRate;