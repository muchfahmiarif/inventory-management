import React from "react";

import HeaderComponents from "@/components/office/header";
import Sidebar from "@/components/office/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutOfficeProps {
  children: React.ReactNode;
}

const LayoutOffice = ({ children }: LayoutOfficeProps) => {
  return (
    <div className="flex">
      <TooltipProvider>
        <Sidebar />
        <main className="min-h-screen w-full bg-primary-foreground dark:bg-gray-950">
          <HeaderComponents />
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
};

export default LayoutOffice;
