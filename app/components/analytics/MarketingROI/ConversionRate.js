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

  // Determine progress bar color based on rate
  const progressColor =
    conversionRate >= 70
      ? "bg-green-500"
      : conversionRate >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="border p-8 rounded-2xl bg-white transition-all">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-semibold text-neutral-700 text-lg">Conversion Rate</h1>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <h4 className="font-bold text-4xl text-neutral-900">{conversionRate}%</h4>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-neutral-100 rounded-full h-2 mt-4">
        <div
          className={`h-2 rounded-full ${progressColor} transition-all`}
          style={{ width: `${conversionRate}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ConversionRate;