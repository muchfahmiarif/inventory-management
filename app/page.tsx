import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <h2 className="text-3xl mb-2">Home Page</h2>
      <Link href={`/office/home/inventory-dashboard`} className={cn(buttonVariants({ variant: "link" }))}>
        Go to dashboard
      </Link>
    </div>
  );
}
