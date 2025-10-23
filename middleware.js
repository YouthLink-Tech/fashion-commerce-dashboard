import { NextResponse } from "next/server";
import {
  getModuleNameFromPath,
  isEditRoute,
  protectedAddRoutes,
  protectedRoutes,
} from "./app/components/ProtectedRoutes/ProtectedRoutes";
import { getToken } from "next-auth/jwt";
import { decodeJwt } from "jose";

export async function middleware(req) {
  const nextUrlPathname = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no session / access token, redirect to login
  if (!token?.accessToken) {
    return NextResponse.redirect(new URL("/auth/restricted-access", req.url));
  }

  // 🔹 Decode accessToken for FRESH permissions (embedded from login/refresh)
  let permissions = [];
  try {
    const decodedAccess = decodeJwt(token.accessToken);  // 🔹 jose decode: No secret needed
    // console.log(decodedAccess, "decodedAccess");
    permissions = decodedAccess?.permissions || [];  // Fresh from backend embed
    // console.log(permissions, "permissions");
  } catch (err) {
    console.error("Access token decode failed:", err);  // Fallback to stale if corrupt
    permissions = token.permissions || [];  // Rare fallback
  }

  // 🔹 Restrict "Viewer" access on Add/Edit routes
  const viewerRoles = permissions?.filter(
    (perm) => perm.role === "Viewer"
  );

  if (viewerRoles?.length) {

    // 👉 Check Add Routes
    const matchedAddRoute = Object.keys(protectedAddRoutes).find((route) =>
      nextUrlPathname.startsWith(route)
    );

    if (matchedAddRoute) {
      const moduleName = getModuleNameFromPath(matchedAddRoute); // e.g. "Product Hub", "Marketing"

      const isViewerBlocked = viewerRoles.some(
        (perm) => perm.modules?.[moduleName]?.access === true
      );

      if (isViewerBlocked) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // 👉 Check Edit Routes
    if (isEditRoute(nextUrlPathname)) {
      const moduleName = getModuleNameFromPath(nextUrlPathname); // infer module from path

      const isViewerBlocked = viewerRoles.some(
        (perm) => perm.modules?.[moduleName]?.access === true
      );

      if (isViewerBlocked) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

  }

  // 🔹 Check if user has permission for the accessed route
  const sortedRoutes = Object.keys(protectedRoutes).sort(
    (a, b) => b.length - a.length
  ); // Sort longest first

  const permissionKey = sortedRoutes.find((route) =>
    nextUrlPathname.startsWith(route)
  );

  if (permissionKey) {
    const permissionCategory = protectedRoutes[permissionKey]; // e.g., "Orders", "Product Hub", etc.

    const hasAccess = permissions?.some(
      (perm) => perm.modules?.[permissionCategory]?.access === true
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/restricted-access|auth/setup|auth/refresh-page|auth/account-deleted|unauthorized).*)",
  ],
};
