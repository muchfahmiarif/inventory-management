import React from "react";

import HeaderComponents from "@/components/office/header";

interface LayoutOfficeProps {
  children: React.ReactNode;
}

const LayoutOffice = ({ children }: LayoutOfficeProps) => {
  return (
    <div className="flex">
      <div className="w-56 min-h-screen bg-slate-800 text-slate-50">Sidebar</div>
      <main className="bg-slate-100 w-full min-h-screen">
        <HeaderComponents />
        {children}
      </main>
    </div>
  );
};

export default LayoutOffice;
