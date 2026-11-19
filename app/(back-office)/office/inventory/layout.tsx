"use client";

import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

interface LayoutInventoryPageProps {
  children: React.ReactNode;
}

const LayoutInventoryPage: React.FC<LayoutInventoryPageProps> = ({
  children,
}) => {
  const pathname = usePathname();

  const hiddenPaths: string[] = [
    "/office/inventory/items/new",
    "/office/inventory/itemgroups/new",
    "/office/inventory/adjustments/new",
  ];

  let isVisible = true;
  for (const hiddenPath of hiddenPaths) {
    if (pathname === hiddenPath) {
      isVisible = false;
      break;
    }
  }

  return (
    <div>
      {isVisible && (
        <div className="absolute right-0 top-[4.3rem] flex items-center justify-center">
          <Button
            variant={"default"}
            size={"sm"}
            className="rounded-l-md rounded-r-none"
          >
            <MessageCircleQuestion className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default LayoutInventoryPage;
