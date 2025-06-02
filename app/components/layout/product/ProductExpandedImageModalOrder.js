import Image from "next/image";
import { useEffect } from "react";
import { CgArrowLeft, CgArrowRight, CgClose } from "react-icons/cg";

export default function ProductExpandedImageModalOrder({
  productTitle,
  selectedColorLabel,
  expandedImgUrl,
  totalImages,
  activeImageIndex,
  setActiveImageIndex,
  isImageExpanded,
  setIsImageExpanded,
}) {
  useEffect(() => {
    document.body.style.overflow = isImageExpanded ? "hidden" : "unset";
  }, [isImageExpanded]);

  return (
    <div
      className={`fixed inset-0 z-10 flex h-dvh w-dvw items-center justify-center bg-black bg-opacity-80 text-neutral-300 backdrop-blur ${isImageExpanded ? "" : "hidden"}`}
      id="expanded-img-bg"
      onClick={(event) =>
        event.target.id === "expanded-img-bg" && setIsImageExpanded(false)
      }
    >
      {/* Text that displays the number of current active image */}
      <p className="absolute left-5 top-5 text-sm">
        {activeImageIndex + 1}/{totalImages}
      </p>
      {/* Modal Close Button */}
      <CgClose
        className="absolute right-5 top-5 cursor-pointer transition-[color] duration-300 ease-in-out hover:text-white"
        size={24}
        onClick={() => setIsImageExpanded(false)}
      />
      {/* Left Nav Button */}
      <CgArrowLeft
        className={`absolute left-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer transition-[opacity,color] duration-300 ease-in-out sm:left-5 sm:size-6 ${activeImageIndex === 0 ? "pointer-events-none opacity-0" : "pointer-events-auto hover:text-white hover:opacity-100"}`}
        onClick={() => setActiveImageIndex(activeImageIndex - 1)}
      />
      {/* Right Nav Button */}
      <CgArrowRight
        className={`absolute right-2.5 top-1/2 size-5 -translate-y-1/2 cursor-pointer transition-[opacity,color] duration-300 ease-in-out sm:right-5 sm:size-6 ${activeImageIndex === totalImages - 1 ? "pointer-events-none opacity-0" : "pointer-events-auto hover:text-white hover:opacity-100"}`}
        size={24}
        onClick={() => setActiveImageIndex(activeImageIndex + 1)}
      />
      <Image
        src={expandedImgUrl}
        alt={`${productTitle} ${selectedColorLabel} ${activeImageIndex + 1} Expanded`}
        height={0}
        width={0}
        className="bg-[var(--product-default)] object-contain portrait:h-auto portrait:max-h-[calc(100dvh-20*4px-24*2px)] portrait:w-[calc(100dvw-10*4px-20px*2)] portrait:sm:w-[calc(100dvw-20*4px-24px*2)] landscape:h-[90vh] landscape:w-auto"
        sizes="90vh"
      />
    </div>
  );
}
