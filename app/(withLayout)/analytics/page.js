import React from 'react';
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import SalesTrendChart from '@/app/components/analytics/SalesTrendChart';
import ProfitabilityBreakdown from '@/app/components/analytics/ProfitabilityBreakdown';
import TopProducts from '@/app/components/analytics/TopProducts';
import LowStock from '@/app/components/analytics/LowStock';
import Header from '@/app/components/analytics/HeaderKPI/Header';
import MarketingROI from '@/app/components/analytics/MarketingROI/MarketingROI';

const AnalyticsPage = () => {
  return (
    <div className='bg-gray-50 relative min-h-[calc(100vh-60px)]'>

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

      <div className='relative mx-auto px-6 pb-4'>

        <div className='w-full mb-6'>
          <h3 className='text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-800'>Analytics</h3>
          <p className='pt-2 text-start font-semibold text-sm text-neutral-500'>Your Analytics Details & performance overview</p>
        </div>

        <Header />

        <div className="flex flex-col md:flex-row flex-wrap justify-start items-center gap-6 mt-6">
          <div className="flex-1 w-full md:w-auto">
            <SalesTrendChart />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <ProfitabilityBreakdown />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="h-full">
            <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto h-full">
              <LowStock />
            </div>
          </div>
          <div className="h-full">
            <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto h-full">
              <TopProducts />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="h-full">
            <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto h-full">
              <MarketingROI />
            </div>
          </div>
          <div className="h-full">
            {/* <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto h-full">

            </div> */}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsPage;