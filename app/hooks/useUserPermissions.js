"use client";
import { useSession } from "next-auth/react";

export const useUserPermissions = () => {
  const { data: session, status } = useSession();

  // Map status to your old isUserLoading (true during "loading")
  const isUserLoading = status === "loading";

  // Fresh permissions from session (decoded/embedded—auto-updated)
  const permissions = session?.user?.permissions || [];

  // Your exact derivation logic (reusable if needed)
  const getRoleForModule = (currentModule) => {
    return permissions?.find(
      (group) => group.modules?.[currentModule]?.access === true
    )?.role || null;
  };

  const isAuthorizedForModule = (currentModule) => {
    const role = getRoleForModule(currentModule);
    return role === "Owner" || role === "Editor";
  };

  const isOwnerForModule = (currentModule) => {
    return getRoleForModule(currentModule) === "Owner";
  };

  const isViewerForModule = (currentModule) => {
    return getRoleForModule(currentModule) === "Viewer";
  };

  // Return like your old useAuth (isUserLoading + raw data)
  return {
    isUserLoading,
    getRoleForModule,
    permissions,
    isAuthorizedForModule,
    isOwnerForModule,
    isViewerForModule
  };
};