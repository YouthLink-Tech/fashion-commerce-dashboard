"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";

export default function GoBackButton() {
  const [href, setHref] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const localHref = localStorage.getItem("initialPage");
    if (localHref) {
      setHref(localHref);
    }
  }, []);

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back(); // Go to last visited page
    } else {
      if (href && pathname === href) return;

      router?.push(href); // fallback
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!href || pathname === href}
      className={`mt-9 rounded-lg px-6 py-3 text-center text-sm font-semibold transition duration-300 ${!href || pathname === href
        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
        : 'bg-[#d4ffce] text-neutral-700 hover:bg-[#bdf6b4]'
        }`}
    >
      <span className="flex items-center gap-2">
        <IoArrowBackOutline size={14} /> Go Back
      </span>
    </button>
  );
}