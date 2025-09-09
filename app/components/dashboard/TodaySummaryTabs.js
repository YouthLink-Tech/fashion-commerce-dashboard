'use client';

import { useState } from 'react';
import TabsButton from './TabsButton'; // Adjust path as needed
import useTodaysOrders from '@/app/hooks/useTodaysOrders';
import Link from 'next/link';
import SmallHeightLoading from '../shared/Loading/SmallHeightLoading';

const TodaySummaryTabs = () => {

  const [activeTab, setActiveTab] = useState('all');
  const [todaysOrders, isTodaysOrdersPending] = useTodaysOrders();

  if (isTodaysOrdersPending) return <SmallHeightLoading />;

  const tabLabels = [
    { key: 'all', title: 'All', subtitle: 'Total cash from all orders today' },
    { key: 'pending', title: 'Pending', subtitle: 'Cash expected from pending orders' },
    { key: 'processing', title: 'Processing', subtitle: 'Cash expected from processing orders' },
    { key: 'delivered', title: 'Delivered', subtitle: 'Cash received from delivered orders' }
  ];

  return (
    <div className="mt-6 border p-8 rounded-lg relative bg-white">
      <h1 className="font-semibold text-neutral-700 text-2xl mb-4">Todays Summary</h1>

      <div className="flex gap-3 mb-4">
        {tabLabels.map(tab => (
          <TabsButton
            key={tab.key}
            label={tab.title}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      <div className='flex justify-center items-center gap-12'>
        <div>
          {tabLabels.map(tab => (
            activeTab === tab.key && (
              <div key={tab.key}>
                <h2 className="text-neutral-600 font-semibold">Total {tab.title.toLowerCase()} orders</h2>
                <h1 className='text-2xl font-semibold'>{todaysOrders?.[tab.key]?.totalOrders ?? 0}</h1>

                <h2 className="text-neutral-600 mt-4 font-semibold">{tab.subtitle}</h2>
                <h1 className='text-3xl font-semibold'>৳ {todaysOrders?.[tab.key]?.totalAmount ?? 0}</h1>
              </div>
            )
          ))}
        </div>

        <Link target='_blank' href={"/orders"} className='rounded-lg bg-[#d4ffce] hover:bg-[#bdf6b4] font-bold text-neutral-700 py-2.5 text-center text-sm transition-[background-color] duration-300 px-1.5'>
          View All
        </Link>

      </div>

    </div>
  );
};

export default TodaySummaryTabs;
