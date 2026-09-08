/*
* FILE: middleware.js 
* PROJECT: SET Capstone - Stratpad
* AUTHORS: 
* DATE: 03 - 19 - 2026
* DESCRIPTION: Handles route protection for the app. Redirects unauthenticated
*              users away from protected routes, prevents logged-in users from
*              accessing auth pages, and blocks non-admins from the admin route.*/


import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { ADMIN_EMAILS } from "@/lib/adminConfiguration"

const protectedRoutes = ["/home", "/account"]


/*
* FUNCTION: middleware
* PARAMETERS: req - the incoming request object
* RETURNS: NextResponse - either a redirect or allows the request through
* DESCRIPTION: Runs on every request and checks if the user is allowed to
*              access the route they are trying to visit.
*/
export function proxy(req) {
  const { nextUrl } = req

  const sessionCookie = getSessionCookie(req)
  const isLoggedIn = Boolean(sessionCookie)

  const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname)
  const isOnAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup"
  const isOnAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin")


  //not allowing users into protected routes if not logged in
  if (isOnProtectedRoute && !isLoggedIn)
  {

        return NextResponse.redirect(new URL("/login", req.url))

  }

  //not allowing users into auth routes if logged in
  if (isOnAuthRoute && isLoggedIn)
  {

      return NextResponse.redirect(new URL("/home", req.url))

  }

    // Does not allow users into admin route if not logged in or not an admin
  if (isOnAdminRoute && !isLoggedIn)
  {

      return NextResponse.redirect(new URL("/login", req.url))

  }
  

    return NextResponse.next()

}


// Only run this middleware on the specified routes, allowing static assets and API routes to be accessed without interference
export const config =
{

    matcher:
    [

        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",

    ]

}