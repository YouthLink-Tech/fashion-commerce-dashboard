"use client";
import React from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import TodaySummaryTabs from '@/app/components/dashboard/TodaySummaryTabs';

const Dashboard = () => {

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
      />
      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      />
      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className='relative max-w-screen-2xl mx-auto px-6'>

        <div className='w-full'>
          <h3 className='text-center md:text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700'>OVERVIEW</h3>
        </div>

        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>

          <TodaySummaryTabs />

          <div className='mt-6 border'>
            {/* <h1 className='font-semibold text-neutral-700'>Todays orders</h1> */}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;