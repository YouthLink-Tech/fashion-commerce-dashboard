"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";

export default function GoBackButton({ defaultHref = "/dashboard" }) {
  const [href, setHref] = useState(defaultHref);
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
      router.push(href); // fallback
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mt-9 rounded-lg bg-[#d4ffce] px-6 py-3 text-center text-sm text-neutral-700 font-semibold transition duration-300 hover:bg-[#bdf6b4]"
    >
      <span className="flex items-center gap-2"><IoArrowBackOutline size={14} /> Go Back </span>
    </button>
  );
}
