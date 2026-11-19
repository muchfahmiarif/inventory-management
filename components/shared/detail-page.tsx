"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DetailPageShellProps {
  title: React.ReactNode;
  // Record number under the title, e.g. "ITEM-00001"
  subtitle?: React.ReactNode;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline";
  // Primary button label on the right, e.g. "Edit"
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  // Dropdown menu contents (converts, delete, etc.)
  actionsMenu?: React.ReactNode;
  // Tab navigation (<TabsList>), rendered under the header
  tabs?: React.ReactNode;
  children?: React.ReactNode;
}

// Record detail shell (Zoho pattern): title + status badge + action dropdown,
// tab strip, then tab content below.
const DetailPageShell = ({
  title,
  subtitle,
  status,
  statusVariant = "secondary",
  primaryActionLabel = "Edit",
  onPrimaryAction,
  actionsMenu,
  tabs,
  children,
}: DetailPageShellProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {status && <Badge variant={statusVariant}>{status}</Badge>}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onPrimaryAction && (
            <Button size="sm" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {actionsMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">{actionsMenu}</DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {tabs}
      <div className="px-8 py-4">{children}</div>
    </div>
  );
};

export default DetailPageShell;
