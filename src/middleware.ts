import { NextResponse, type NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, search } = request.nextUrl;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/b/") ||
    pathname.startsWith("/h2h/") ||
    search
  ) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return response;
}
export const config = {
  matcher: ["/((?!_next/|favicon.ico|icon.svg|apple-icon).*)"],
};
