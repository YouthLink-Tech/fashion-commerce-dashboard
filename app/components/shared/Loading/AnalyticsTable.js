import { Skeleton } from '@nextui-org/react';
import React from 'react';

const AnalyticsTable = () => {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className='w-full flex items-center gap-3'>
        <div>
          <Skeleton className="flex rounded-full w-12 h-12" />
        </div>
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-5 w-full rounded-lg" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
        <Skeleton className="h-5 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
};

export default AnalyticsTable;