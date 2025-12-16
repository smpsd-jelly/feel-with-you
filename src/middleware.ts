// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/after-login", "/jigsaw-home"]; 

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // static / public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon-v2.ico"
  ) {
    return NextResponse.next();
  }

  // อ่าน token (ใส่ SECRET ให้ชัดใน edge)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token && (token as any).userId;

  // กันเข้า /login ถ้า login แล้ว → เด้งไป callbackUrl หรือหน้าแรก
  if (pathname === "/login") {
    if (token && userId) {
      const to = searchParams.get("callbackUrl") || "/";
      const url = req.nextUrl.clone();
      url.pathname = to.startsWith("/") ? to : "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // ยังไม่ login → เข้าหน้า login ได้
    return NextResponse.next();
  }

  //  อนุญาต public paths อื่น ๆ
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // ต้องมี token + userId ถึงจะเข้าเพจทั่วไปได้
  if (!token || !userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // ส่ง callbackUrl กลับมาที่เดิมหลัง login
    url.searchParams.set("callbackUrl", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon-v2.ico|images|uploads|api/auth).*)",
  ],
};
