"use client";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import promo from "/public/card-images/promo.jpg";
import specialOffer from "/public/card-images/special-offer.jpg";
import RecentPromotions from '@/app/components/marketing/RecentPromotions';
import PromotionPerformance from '@/app/components/marketing/PromotionPerformance';
import MarketingContent from '@/app/components/marketing/MarketingContent';
import { useAuth } from "@/app/contexts/auth";
import Loading from "@/app/components/shared/Loading/Loading";
import RewardLevel from "../reward-level/page";
import { WEBSITE_NAME } from "@/app/config/config";

const currentModule = "Marketing";

const Marketing = () => {

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('view performance');
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";

  // Ensure the code runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTabMarketingPage');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTabMarketingPage', activeTab);
    }
  }, [activeTab]);

  if (isUserLoading) {
    return <Loading />
  };

  return (
    <div className='px-6 md:px-10 bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] md:-top-[70px]'
      />

      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center top-96 xl:top-28 w-full bg-no-repeat'
      />

      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-52 md:top-36 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[20%] lg:bg-[length:200px_100px] md:left-[0%] xl:left-[10%] 2xl:left-[25%] bg-no-repeat'
      />

      <div className="bg-gray-50 sticky top-0 z-10 max-w-screen-2xl mx-auto">
        <h1 className="font-bold text-lg md:text-xl lg:text-3xl text-neutral-700 py-1 2xl:py-3 bg-gray-50">MARKETING</h1>

        <div className="flex flex-wrap items-center gap-3 bg-gray-50">

          <button
            className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'view performance' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'view performance' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
            onClick={() => setActiveTab('view performance')}
          >
            View performance
          </button>

          {isAuthorized &&
            <button
              className={`relative text-sm py-1 transition-all duration-300
      ${activeTab === 'create promotions' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
      after:absolute after:left-0 after:right-0 after:bottom-0 
      after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
      ${activeTab === 'create promotions' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
    `}
              onClick={() => setActiveTab('create promotions')}
            >
              Create Promotions
            </button>
          }

          <button
            className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'reward level' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'reward level' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
      `}
            onClick={() => setActiveTab('reward level')}
          >
            Reward Level
          </button>

          {isAuthorized &&
            <button
              className={`relative text-sm py-1 transition-all duration-300
        ${activeTab === 'marketing content' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
        after:absolute after:left-0 after:right-0 after:bottom-0 
        after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
        ${activeTab === 'marketing content' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
      `}
              onClick={() => setActiveTab('marketing content')}
            >
              Marketing Content
            </button>
          }

        </div>
      </div>

      {
        activeTab === "view performance" &&
        <div className='pt-4 relative max-w-screen-2xl mx-auto'>
          <h1 className='font-bold'>Promotion Performance</h1>
          <p className='pt-1 text-neutral-400 text-sm font-medium'>The data includes all active, ended, or canceled deals. This report represents unaudited data, please refer to your invoice for accurate settlement numbers.</p>
          <PromotionPerformance />

          <h1 className='font-bold pt-12 lg:pt-6'>Recent Promotions</h1>
          <p className='pt-1 pb-8 text-neutral-400 text-sm font-medium'>Please use the following table to view your past and upcoming promotions.</p>
          <RecentPromotions />
        </div>
      }

      {
        isAuthorized &&
        activeTab === "create promotions" &&
        <div className='pt-6 relative max-w-screen-2xl mx-auto'>
          <h1 className='font-bold text-xl'>Recommended For You</h1>
          <p className='pt-1 pb-8 text-neutral-400 font-medium'>{`Our recommendations are tailored to suit your ${WEBSITE_NAME} and customer preferences`}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-screen-2xl">

            {/* Promo Card */}
            {isAuthorized &&
              <div className="flex-1 overflow-hidden rounded-lg shadow transition hover:shadow-lg flex flex-col">

                {/* Set the container to maintain the aspect ratio */}
                <div className="relative w-full" style={{ paddingBottom: '38.25%' }}>
                  {/* This maintains a 16:9 aspect ratio */}
                  <Image
                    alt="promo"
                    src={promo} // Ensure this path is correct
                    layout="fill"
                    className="object-contain" // Ensures the full image is visible
                  />
                </div>

                <div className="bg-white p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="mb-0.5 text-xl text-gray-900 font-bold">
                    Launch Your Next Big Promo
                  </h3>
                  <p className="text-neutral-500 text-sm flex-grow">
                    Capture your customers attention with a well-crafted promotion. Whether
                    it is a seasonal sale or a flash discount, create a promo that aligns
                    with your brand and drives conversions. Customize the offer, set the
                    duration, and monitor its performance—all in one place.
                  </p>
                  <button
                    onClick={() => router.push('/marketing/promo/add-promo')}
                    className="w-full rounded-lg bg-[#d4ffce] py-2.5 text-center text-sm transition-[background-color] duration-300 hover:bg-[#bdf6b4] font-semibold text-neutral-700"
                  >
                    Create Promo
                  </button>
                </div>

              </div>
            }

            {/* Offer Card */}
            {isAuthorized &&
              <div className="flex-1 overflow-hidden rounded-lg shadow transition hover:shadow-lg flex flex-col">
                {/* Maintain the same aspect ratio for the second image */}
                <div className="relative w-full" style={{ paddingBottom: '38.25%' }}> {/* This maintains a 16:9 aspect ratio */}
                  <Image
                    alt="offer"
                    src={specialOffer} // Ensure this path is correct
                    layout="fill"
                    className="object-contain" // Ensures the full image is visible
                  />
                </div>
                <div className="bg-white p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="mb-0.5 text-xl text-gray-900 font-bold">
                    Unlock Special Offer Deals
                  </h3>
                  <p className="text-neutral-500 text-sm flex-grow">
                    Encourage repeat purchases and attract new customers with irresistible
                    offers. Create limited-time deals that fit your strategy, whether it is
                    a buy-one-get-one or a percentage discount. Stand out from the
                    competition with offers that make your store a go-to for shoppers.
                  </p>
                  <button
                    onClick={() => router.push('/marketing/offer/add-offer')}
                    className="w-full rounded-lg bg-[#d4ffce] py-2.5 text-center text-sm transition-[background-color] duration-300 hover:bg-[#bdf6b4] font-semibold text-neutral-700 mt-4"
                  >
                    Create Offer
                  </button>
                </div>
              </div>
            }

          </div>

        </div>
      }

      {activeTab === "reward level" && <div className='pt-6 relative max-w-screen-2xl mx-auto'>
        <h1 className='font-bold text-xl'>Recommended For You</h1>
        <p className='pt-1 pb-8 text-neutral-400 font-medium'>{`Our recommendations are tailored to suit your ${WEBSITE_NAME} and customer preferences`}</p>
        <RewardLevel />
      </div>}

      {
        isAuthorized &&
        activeTab === "marketing content" && <div className='pt-6 relative max-w-screen-2xl mx-auto'>
          <h1 className='font-bold text-xl'>Recommended For You</h1>
          <p className='pt-1 pb-8 text-neutral-400 font-medium'>{`Our recommendations are tailored to suit your ${WEBSITE_NAME} and customer preferences`}</p>
          <MarketingContent />
        </div>
      }

    </div >
  );
};

export default Marketing;