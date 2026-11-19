"use client";

import {
  ArrowDownNarrowWide,
  Download,
  EllipsisVertical,
  Mail,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  Settings,
  Upload,
} from "lucide-react";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface KebabMenuProps {
  // Module label for Import/Export entries, e.g. "Items", "Item Groups"
  moduleLabel: string;
  sortBy?: string[];
  onImport?: () => void;
  onExport?: () => void;
  onPreference?: () => void;
  onRefresh?: () => void;
}

// The "..." options menu on list pages (Zoho: Sort by / Import / Export /
// Preference / Refresh List)
const KebabMenu = ({
  moduleLabel,
  sortBy = ["Name", "Created Time", "Updated Time"],
  onImport,
  onExport,
  onPreference,
  onRefresh,
}: KebabMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowDownNarrowWide className="mr-2 h-4 w-4 text-primary" />
            <span>Sort by</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {sortBy.map((field) => (
                <DropdownMenuItem key={field}>{field}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>More...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onImport}>
          <Download className="mr-2 h-4 w-4 text-primary" />
          <span>Import {moduleLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <Upload className="mr-2 h-4 w-4 text-primary" />
          <span>Export {moduleLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onPreference}>
          <Settings className="mr-2 h-4 w-4 text-primary" />
          <span>Preference</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4 text-primary" />
          <span>Refresh List</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KebabMenu;
