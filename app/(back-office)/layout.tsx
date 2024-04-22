import React from "react";

import HeaderComponents from "@/components/office/header";
import Sidebar from "@/components/office/sidebar";

interface LayoutOfficeProps {
  children: React.ReactNode;
}

const LayoutOffice = ({ children }: LayoutOfficeProps) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="bg-primary-foreground w-full min-h-screen">
        <HeaderComponents />
        {children}
      </main>
    </div>
  );
};

export default LayoutOffice;
