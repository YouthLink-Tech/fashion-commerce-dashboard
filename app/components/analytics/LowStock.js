"use client";
import React from 'react';
import useAnalyticsLowStock from '@/app/hooks/useAnalyticsLowStock';
import AnalyticsTable from '../shared/Loading/AnalyticsTable';
import { TbAlertTriangle } from "react-icons/tb";
import LowStockTable from './LowStockTable';

const LowStock = () => {

  const [analyticsLowStock, isAnalyticsLowStockPending] = useAnalyticsLowStock();

  if (isAnalyticsLowStockPending) return <AnalyticsTable />;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-3"><TbAlertTriangle className='text-red-600' /> Stock Alerts</h2>
      <p className='pt-2 text-start font-semibold text-sm text-neutral-500 mb-4'>Products requiring immediate attention</p>
      <LowStockTable analyticsLowStock={analyticsLowStock} />
    </div>
  );
};

export default LowStock;