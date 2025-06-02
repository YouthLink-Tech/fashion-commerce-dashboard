"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/app/contexts/loading";

function TransitionLinkInner({
  children,
  href,
  hasDrawer,
  setIsDrawerOpen,
  ...props
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsPageLoading } = useLoading();

  const handleTransition = (event) => {
    event.preventDefault();

    const filterParam = searchParams.get("filterBy");
    const isSamePage = !filterParam
      ? href === pathname
      : href.includes(filterParam.split(" ").join("+"));

    if (!isSamePage) {
      setIsPageLoading(true);
      if (hasDrawer) setIsDrawerOpen(false);
      router.push(href);
    }
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}

export default function TransitionLink(props) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} {...props}>
          {props.children}
        </Link>
      }
    >
      <TransitionLinkInner {...props} />
    </Suspense>
  );
}
