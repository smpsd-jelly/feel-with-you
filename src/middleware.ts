// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/home-test",     
  "/after-login",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // อนุญาต asset/system path
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon-v2.ico"
  ) {
    return NextResponse.next();
  }

  // อนุญาต public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // เช็ค token สำหรับหน้าอื่น ๆ
  const token = await getToken({ req });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon-v2.ico|images|api/auth).*)"],
};
