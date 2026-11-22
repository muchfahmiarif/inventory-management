import React from "react";

import HeaderComponents from "@/components/office/header";
import Sidebar from "@/components/office/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages fetch from the Go backend at request time (with the Clerk session
// token); prerendering them at build time would run unauthenticated.
export const dynamic = "force-dynamic";

interface LayoutOfficeProps {
  children: React.ReactNode;
}

const LayoutOffice = ({ children }: LayoutOfficeProps) => {
  return (
    <div className="flex">
      <TooltipProvider>
        <Sidebar />
        <main className="min-h-screen w-full bg-primary-foreground dark:bg-background">
          <HeaderComponents />
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
};

export default LayoutOffice;
