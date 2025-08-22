import OurStories from '@/app/components/settings/story/OurStories';
import OurStoryNavbar from '@/app/components/settings/story/OurStoryNavbar';
import React from 'react';

const OurStoryPage = () => {

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-60px)] relative'>

      <div className="px-6 md:px-10">

        <OurStoryNavbar />
        <OurStories />

      </div>

    </div>
  );
};

export default OurStoryPage;