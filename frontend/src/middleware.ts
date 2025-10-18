import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import axiosInstance from "@/lib/api-client";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/public"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  try {
    const headers = Object.fromEntries(req.headers.entries());
    await axiosInstance.get("/users/check-auth", {
      headers,
    });

    return NextResponse.next();
  } catch (err) {
    console.error("Error authenticating in middleware:", err);

    const url = req.nextUrl.clone();

    url.pathname = "/";
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/public).*)"], // protect everything except
};
