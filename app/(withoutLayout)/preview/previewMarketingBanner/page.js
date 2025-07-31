import PreviewMarketingBannerContents from '@/app/components/preview/PreviewMarketingBannerContents';
import Loading from '@/app/components/shared/Loading/Loading';
import React, { Suspense } from 'react';

const PreviewMarketingBanner = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PreviewMarketingBannerContents />
    </Suspense>
  );
};

export default PreviewMarketingBanner;