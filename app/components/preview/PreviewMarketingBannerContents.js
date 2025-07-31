"use client";
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import TopFooterWrapper from './TopFooterWrapper';
import TopFooterBanner from './TopFooterBanner';
import TopFooterNewsletter from './TopFooterNewsLetter';

const PreviewMarketingBannerContents = () => {

  const searchParams = useSearchParams();
  const image = searchParams.get("image");
  const position = searchParams.get("position");

  return (
    <TopFooterWrapper position={position}>
      <TopFooterBanner image={image} position={position} />
      <TopFooterNewsletter />
    </TopFooterWrapper>

  );
};

export default PreviewMarketingBannerContents;