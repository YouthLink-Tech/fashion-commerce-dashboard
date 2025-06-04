"use client";
import ColorPaletteSettings from '@/app/components/settings/brand/ColorPaletteSettings';
import LogoSettings from '@/app/components/settings/brand/LogoSettings';
import TabsForSettings from '@/app/components/settings/tabs/TabsForSetting';
import Loading from '@/app/components/shared/Loading/Loading';
import { useAuth } from '@/app/contexts/auth';
import React, { useState } from 'react';

const currentModule = "Settings";

const BrandPage = () => {

  const [activeTab, setActiveTab] = useState('Logo Settings');
  const tabs = ["Logo Settings", "Color Palette Settings"];
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";

  if (isUserLoading) {
    return <Loading />
  };

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative px-6 md:px-10'>

      {isAuthorized &&
        <div>
          <div className="bg-gray-50 sticky top-0 z-10 max-w-screen-sm mx-auto">

            <h1 className="font-bold text-lg md:text-xl lg:text-3xl text-neutral-700 py-1 2xl:py-3 bg-gray-50">BRAND SETTINGS</h1>

            <TabsForSettings tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          </div>

          {activeTab === "Logo Settings" &&
            <div className='pt-4 max-w-screen-sm mx-auto pb-6'>
              <LogoSettings />
            </div>
          }

          {activeTab === "Color Palette Settings" &&
            <div className='pt-4 max-w-screen-sm mx-auto pb-6'>
              <ColorPaletteSettings />
            </div>
          }
        </div>
      }

    </div >
  );
};

export default BrandPage;