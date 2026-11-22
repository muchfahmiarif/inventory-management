"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

// Gate: without NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, ClerkProvider throws.
// Until keys are configured the app renders unauthenticated with a warning;
// remove this gate behavior naturally disappears once keys exist.
export function ClerkProviderGate({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.warn(
      "[clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing — auth disabled. " +
        "Copy .env.example to .env and fill the Clerk keys.",
    );
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
