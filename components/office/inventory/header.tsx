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

const HeaderInventoryPage = ({
  className,
  children,
}: HeaderInventoryPageProps) => {
  const [isMounter, setIsMounter] = React.useState(false);

  React.useEffect(() => {
    setIsMounter(true);
  }, []);

  if (!isMounter) return null;

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
