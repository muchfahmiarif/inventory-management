"use client";

import {
  ArrowDownNarrowWide,
  ChevronDown,
  Download,
  EllipsisVertical,
  List,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  RefreshCcw,
  Settings,
  Upload,
} from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderInventoryPageProps {
  className?: string;
  dataTitle?: Array<{ name: string; href: string }>;
  titleDropdown?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

const HeaderInventoryPage = ({ className, children }: HeaderInventoryPageProps) => {
  const [isMounter, setIsMounter] = React.useState(false);

  React.useEffect(() => {
    setIsMounter(true);
  }, []);

  if (!isMounter) return null;

  return <div className={cn("sticky top-0 mx-2 my-4 flex flex-row justify-between items-center", className)}>{children}</div>;
};

export default HeaderInventoryPage;
