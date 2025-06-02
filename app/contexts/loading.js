"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LoadingContext = createContext({
  isPageLoading: false,
  setIsPageLoading: null,
});

export const LoadingProvider = ({ children }) => {
  const pathname = usePathname();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsPageLoading(false);

    return () => setIsPageLoading(true);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  return useContext(LoadingContext);
};
