import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const override = request.cookies.get("country_override")?.value;

  // Manual override takes priority — user chose explicitly
  if (override) return NextResponse.next();

  const ipCountry = request.headers.get("x-vercel-ip-country");

  if (ipCountry === "SE" && pathname === "/") {
    return NextResponse.redirect(new URL("/sweden", request.url));
  }
  if (ipCountry === "NO" && pathname === "/sweden") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sweden"],
};
