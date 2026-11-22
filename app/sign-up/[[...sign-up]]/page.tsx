import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Clerk is not configured yet — set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env
      </main>
    );
  }
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  );
}
