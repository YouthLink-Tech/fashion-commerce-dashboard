import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ErrorSvg from '/public/not-found/no-results.png';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      <Image
        src={ErrorSvg}
        alt="404 - Not Found"
        width={300}
        height={300}
        className="mb-6"
        priority
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops! Page not found</h1>
      <p className="text-gray-500 text-base max-w-md mb-6">
        The page you are looking for doesn’t exist or has been moved. Let’s get you back on track.
      </p>

      <Link
        href="/"
        className="flex gap-4 mt-9 rounded-lg bg-[#d4ffce] px-6 py-3 text-center text-sm text-neutral-700 font-semibold transition-[background-color] duration-300 hover:bg-[#bdf6b4]"
      >
        <span>⬅</span>  Go Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
