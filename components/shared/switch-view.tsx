"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import React from "react";

export type SwitchViewValue = "list" | "grid";

interface SwitchViewProps {
  value: SwitchViewValue;
  onChange: (value: SwitchViewValue) => void;
}

// Zoho-style list/grid toggle pill, used by every list page
const SwitchView = ({ value, onChange }: SwitchViewProps) => {
  return (
    <div className="flex h-max w-max items-center rounded-lg bg-black">
      <button
        type="button"
        aria-label="List view"
        className={cn(
          "flex h-9 w-10 items-center justify-center rounded-l-lg p-2",
          value === "list"
            ? "bg-zinc-500"
            : "cursor-pointer hover:bg-zinc-800",
        )}
        onClick={() => onChange("list")}
      >
        <div className="text-white">
          <List className="h-4 w-4" />
        </div>
      </button>
      <button
        type="button"
        aria-label="Grid view"
        className={cn(
          "flex h-9 w-10 items-center justify-center rounded-r-lg p-2",
          value === "grid"
            ? "bg-zinc-500"
            : "cursor-pointer hover:bg-zinc-800",
        )}
        onClick={() => onChange("grid")}
      >
        <div className="text-white">
          <LayoutGrid className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
};

export default SwitchView;
