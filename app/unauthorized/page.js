import Image from 'next/image';
import Link from 'next/link';
import logoWhiteImage from "/public/logos/logo.png";
import React, { Suspense } from 'react';
import { WEBSITE_NAME } from "@/app/config/config";

const Unauthorized = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-screen flex flex-col bg-gray-50">

        <div className="px-4 transition-colors duration-1000 sticky top-0 pt-1.5 z-10 bg-gray-50">
          <Link href="/" legacyBehavior>
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
          <Link
            href="/"
            className="mt-9 block rounded-lg bg-[#d4ffce] px-4 py-2.5 text-center text-sm text-neutral-700 font-semibold transition-[background-color] duration-300 hover:bg-[#bdf6b4]"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </Suspense>
  );
};

export default Unauthorized;