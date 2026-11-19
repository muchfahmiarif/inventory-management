"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface HeaderInventoryPageProps {
  className?: string;
  dataTitle?: Array<{ name: string; href: string }>;
  titleDropdown?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

// Sticky toolbar container for inventory list pages. Renders children directly
// (no pre-mount guard) so the toolbar is visible in SSR HTML.
const HeaderInventoryPage = ({
  className,
  children,
}: HeaderInventoryPageProps) => {
  return (
    <div
      className={cn(
        "sticky top-0 mx-2 my-4 flex flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default HeaderInventoryPage;
