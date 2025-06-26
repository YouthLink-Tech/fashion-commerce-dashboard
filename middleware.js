import { NextResponse } from "next/server";
import {
  getModuleNameFromPath,
  isEditRoute,
  protectedAddRoutes,
  protectedRoutes,
} from "./app/components/ProtectedRoutes/ProtectedRoutes";
import { getToken } from "next-auth/jwt";

// Helper function to fetch user permissions
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchUserPermissions = async (userId, token, retries = 2, delayMs = 300) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://fc-backend-664306765395.asia-south1.run.app/single-existing-user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          ok: true,
          permissions: data?.permissions || [],
        };
      }

      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
      }

      if (response.status === 404) {
        return { ok: false, reason: "not_found" };
      }

      console.warn(`Fetch attempt ${attempt + 1} failed:`, response.status);
    } catch (err) {
      console.error(`Attempt ${attempt + 1} error:`, err);
    }

    if (attempt < retries) {
      await delay(delayMs);
    }
  }

  return { ok: false, reason: "network_error" };
};

const isTokenExpired = (token) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return token?.exp && token.exp < nowInSeconds;
};

export async function middleware(req) {
  const nextUrlPathname = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const justRefreshed = req.cookies.get("just-refreshed")?.value === "true";
  // console.log("justRefreshed:", justRefreshed);
  // console.log(token, "token");

  // ⛔ Prevent loop if already refreshed
  if (justRefreshed) {
    const response = NextResponse.next();

    // ⛔ Cookie deletion must be correct
    response.cookies.set("just-refreshed", "false", { maxAge: 0, path: "/" });

    // console.log("Skipping refresh because just refreshed recently.");
    return response;
  };

  // console.log("justRefreshed (middleware):", justRefreshed);
  // console.log("Token expired?", isTokenExpired(token));
  // console.log("Current path:", req.nextUrl.pathname);

  if (!token || !token.accessToken) {
    const hasRefreshToken = req.cookies.get("refresh-token");

    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL("/auth/restricted-access", req.url));
    }

    // console.log(req.url, "req.url");
    // console.log(req.nextUrl.pathname, "req.nextUrl.pathname");

    const refreshUrl = new URL("/auth/refresh-page", req.url);
    refreshUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(refreshUrl);
  }

  // ❌ If token is expired, just redirect without clearing cookies
  if (isTokenExpired(token)) {
    console.warn("Access token expired in middleware.");

    const refreshUrl = new URL("/auth/refresh-page", req.url);
    refreshUrl.searchParams.set("redirect", req.nextUrl.pathname);

    return NextResponse.redirect(refreshUrl);
  }

  // 🔹 Fetch user permissions from your API
  const userId = token?._id; // Assuming `sub` contains the user ID
  const accessToken = token.accessToken;

  const userPermissionsResponse = await fetchUserPermissions(userId, accessToken);
  // console.log(userPermissionsResponse, "userPermissionsResponse");

  if (!userPermissionsResponse.ok) {
    if (userPermissionsResponse.reason === "unauthorized") {
      const refreshUrl = new URL("/auth/refresh-page", req.url);
      refreshUrl.searchParams.set("redirect", req.nextUrl.pathname);

      return NextResponse.redirect(refreshUrl);
    }

    if (userPermissionsResponse.reason === "not_found") {
      return NextResponse.redirect(new URL("/auth/account-deleted", req.url));
    }

    // If backend is down, refresh might help, or retry later
    return NextResponse.redirect(new URL("/auth/refresh-page", req.url));
  }

  const userPermissions = userPermissionsResponse;

  // 🔹 Restrict "Viewer" access on Add/Edit routes
  const viewerRoles = userPermissions?.permissions?.filter(
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

    const hasAccess = userPermissions?.permissions?.some(
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
    "/((?!api|_next/static|_next/image|favicon.ico|auth/restricted-access|auth/setup|auth/refresh-page|auth/account-deleted).*)",
  ],
};
