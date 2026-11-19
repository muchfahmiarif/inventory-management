import React from "react";

import { cn } from "@/lib/utils";

interface ListToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

// Composition shell for list pages: title dropdown on the left,
// New / view toggle / kebab menu on the right (Zoho toolbar layout).
const ListToolbar = ({ left, right, className }: ListToolbarProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>{left}</div>
      <div className="flex flex-row items-center gap-x-2">{right}</div>
    </div>
  );
};

export default ListToolbar;
