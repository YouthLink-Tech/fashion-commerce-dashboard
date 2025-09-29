import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { WEBSITE_NAME } from "@/app/config/config";
import useLogo from '@/app/hooks/useLogo';

const Logo = ({ isCollapsed }) => {

  const [href, setHref] = useState(null);
  const [logoList, isLogoPending] = useLogo();
  const [logo, setLogo] = useState(null);
  const [logo2, setLogo2] = useState(null);

  useEffect(() => {
    const localHref = localStorage.getItem("initialPage");
    if (localHref) {
      setHref(localHref);
    }
  }, []);

  useEffect(() => {
    if (logoList && logoList.length > 0) {
      setLogo(logoList[0]?.desktopLogoUrl);
      setLogo2(logoList[0]?.mobileLogoUrl);
    }
  }, [logoList]);

  if (isLogoPending) return <>{[...Array(1)].map((_, i) => (
    <div key={`s-${i}`} className="h-8 bg-gray-200 rounded w-[60%] mx-auto" />
  ))}</>;

  return (
    <>
      {href && logo &&
        <Link
          href={href}
          target="_blank"
          className="flex items-center justify-center xl:justify-start gap-2"
        >
          {isCollapsed ?
            <Image
              className="h-9 md:h-10 w-auto"
              src={logo2}
              height={600}
              width={600}
              alt={WEBSITE_NAME}
              priority
            />
            : <Image
              className="h-9 md:h-10 w-auto"
              src={logo}
              height={600}
              width={600}
              alt={WEBSITE_NAME}
              priority
            />}
        </Link>
      }
    </>
  );
};

export default Logo;