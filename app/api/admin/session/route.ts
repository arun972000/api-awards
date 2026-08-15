import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "private, no-store, max-age=0" };

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const username =
      typeof body === "object" && body && "username" in body
        ? String(body.username).trim()
        : "";
    const password =
      typeof body === "object" && body && "password" in body ? String(body.password) : "";

    if (!username || username.length > 100 || !password || password.length > 300) {
      return NextResponse.json(
        { error: "Enter your username and password." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "The username or password is incorrect." },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders });
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession(), adminCookieOptions());
    return response;
  } catch (error) {
    console.error("Admin sign-in failed", error);
    return NextResponse.json(
      { error: "Admin access is not configured correctly." },
      { status: 503, headers: noStoreHeaders },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
