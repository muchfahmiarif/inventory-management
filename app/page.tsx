import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-2 text-3xl">Home Page</h2>
      <Link
        href={`/office/home/inventory-dashboard`}
        className={cn(buttonVariants({ variant: "link" }))}
      >
        Go to dashboard
      </Link>
    </div>
  );
}
