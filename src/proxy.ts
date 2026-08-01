import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSessionCookieValue } from "@/lib/adminAuth";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const cookie = req.cookies.get(ADMIN_COOKIE.name)?.value;
    if (!(await isValidSessionCookieValue(cookie))) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
