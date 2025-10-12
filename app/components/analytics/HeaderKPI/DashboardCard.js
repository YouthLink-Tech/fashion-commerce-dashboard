import React from 'react';
import AnalyticsCard from '../../shared/Loading/AnalyticsCard';
import { FaCircleInfo } from "react-icons/fa6";
import { Button, Tooltip } from '@nextui-org/react';

const DashboardCard = ({ icon: Icon, title, unit, formula, value, loading, error }) => {

  if (loading || value === null || value === "") return <AnalyticsCard />;

  if (error) {
    return (
      <div className="h-32 min-w-[180px] flex justify-center items-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  };

  return (
    <div className="h-36 min-w-[180px] border rounded-lg bg-white p-8 flex flex-col justify-between relative overflow-visible">

      {/* Info icon with tooltip */}
      {formula && (
        <div className="absolute top-2 right-2 group">
          <Tooltip
            content={
              <div className="px-1 py-2">
                <div className="text-small font-bold">{title}</div>
                <div className="text-tiny whitespace-pre-wrap">{formula}</div>
              </div>
            }
          >
            <Button color='foreground' className="p-0 m-0 w-auto h-auto min-w-0 min-h-0 border-none"><FaCircleInfo size={16} className="text-gray-700 cursor-pointer" /></Button>
          </Tooltip>
        </div>
      )}

      <div className="flex items-center gap-1 2xl:gap-2">
        <p className="inline-flex items-center justify-center border rounded-full p-2 bg-gray-200 shrink-0">
          <Icon className="text-blue-700" size={18} strokeWidth={1} />
        </p>
        <h1 className="font-semibold text-neutral-700 text-sm xl:text-base 2xl:text-lg whitespace-nowrap">
          {title}
        </h1>
      </div>

      <h4 className="font-semibold text-xl lg:text-2xl text-neutral-800 flex items-center gap-1">
        {unit === "taka" && "৳"}
        <span>{value}</span>
        {unit === "percent" && "%"}
      </h4>

    </div>
  );
};

export default DashboardCard;