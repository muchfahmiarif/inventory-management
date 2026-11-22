import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

// Protect the back-office. Public routes: /, /sign-in, /sign-up, /api/*.
const isProtectedRoute = createRouteMatcher(["/office(.*)"]);

const clerkAuth = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

const passthrough = () => NextResponse.next();

if (!clerkConfigured) {
  console.warn(
    "[clerk] keys missing in .env — middleware running in passthrough mode " +
      "(no route protection). Copy .env.example to .env and fill the Clerk keys.",
  );
}

export default clerkConfigured ? clerkAuth : passthrough;

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
