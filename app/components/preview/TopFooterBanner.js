import Image from "next/image";

export default function TopFooterBanner({ image, position }) {
  return (
    <div
      className={`relative block h-40 w-full ${position === "right" ? "order-last" : ""}`}
    >
      {!!image && (
        <Image
          src={image}
          className="h-full w-full object-contain"
          alt="Marketing Banner"
          height={0}
          width={0}
          sizes="100dvw"
        />
      )}
    </div>
  );
}
