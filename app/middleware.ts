import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl

  const code = url.searchParams.get("code")

  if (code) {
    const callbackUrl = new URL("/auth/callback", req.url)
    callbackUrl.searchParams.set("code", code)

    return NextResponse.redirect(callbackUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
