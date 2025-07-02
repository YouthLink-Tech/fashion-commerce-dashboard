"use client";
import Image from 'next/image';
import Link from 'next/link';
import logoWhiteImage from "/public/logos/logo.png";
import React, { Suspense, useEffect, useState } from 'react';
import { WEBSITE_NAME } from "@/app/config/config";
import GoBackButton from '../components/ui/GoBackButton';

const Unauthorized = () => {

  const [initialPage, setInitialPage] = useState("/dashboard");

  useEffect(() => {
    const storedPage = localStorage.getItem("initialPage");
    if (storedPage) {
      setInitialPage(storedPage);
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-screen flex flex-col bg-gray-50">

        <div className="px-4 transition-colors duration-1000 sticky top-0 pt-1.5 z-10 bg-gray-50">
          <Link href={initialPage} legacyBehavior>
            <a target="_blank" className="flex items-center justify-center gap-2">
              <Image
                className="h-9 md:h-10 w-auto"
                src={logoWhiteImage}
                alt={WEBSITE_NAME}
              />
            </a>
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-lg">You do not have permission to access this page.</p>
          <GoBackButton defaultHref="/dashboard" />
        </div>

      </div>
    </Suspense>
  );
};

export default Unauthorized;