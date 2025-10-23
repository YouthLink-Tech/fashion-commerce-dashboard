"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRefreshPermissions } from "@/app/hooks/useRefreshPermissions";

export const PermissionsSyncProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const { refreshPermissions } = useRefreshPermissions();
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (!hasSynced && status === "authenticated" && session?.user?._id) {
      // Silent one-time sync on mount (e.g., page refresh)
      refreshPermissions(false);  // No toast
      setHasSynced(true);
    }
  }, [hasSynced, status, session?.user?._id, refreshPermissions]);

  return <>{children}</>;
};