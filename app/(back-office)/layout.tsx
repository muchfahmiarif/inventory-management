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
        <main className="bg-primary-foreground w-full min-h-screen">
          <HeaderComponents />
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
};

export default LayoutOffice;
