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

interface NavbarInventoryPageProps {
  className?: string;
}

const NavbarInventoryPage = ({ className }: NavbarInventoryPageProps) => {
  return (
    <div className={cn("sticky top-0 mx-2 my-4 flex flex-row justify-between items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-xl p-2 border-none">
          All Item Groups
          <ChevronDown strokeWidth={"3px"} className="h-4 w-4 text-primary ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-5 -mt-2">
          <DropdownMenuItem className="cursor-pointer focus:bg-primary focus:text-white ps-4 pr-6">All Item Groups</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-primary focus:text-white ps-4 pr-6">Active Item Groups</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-primary focus:text-white ps-4 pr-6">Inactive Item Groups</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-row gap-x-4 items-center">
        <Toggle variant={"outline"} size={"sm"}>
          <List className="w-4 h-4" />
        </Toggle>
        <Button className="flex flex-row" size={"sm"}>
          <Plus className="w-4 h-4" />
          <p>New</p>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
              <EllipsisVertical className="w-4 h-4" />
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
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4 text-primary" />
              <span>Import Item Groups</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4 text-primary" />
              <span>Export Item Groups</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4 text-primary" />
              <span>Preference</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RefreshCcw className="mr-2 h-4 w-4 text-primary" />
              <span>Refresh List</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavbarInventoryPage;
