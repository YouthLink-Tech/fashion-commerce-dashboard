import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("just-refreshed", "true", {
    httpOnly: true,
    maxAge: 10, // seconds
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production", // ✅ allow localhost dev
  });

  return response;
};