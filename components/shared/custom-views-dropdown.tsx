"use client";

import { ChevronDown, PlusCircle } from "lucide-react";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface CustomView {
  name: string;
  value?: string;
}

interface CustomViewsDropdownProps {
  title: string;
  views: CustomView[];
  selected?: string;
  onSelect?: (view: CustomView) => void;
  onNewCustomView?: () => void;
}

// Title dropdown on list pages: custom views + "+ New Custom View"
const CustomViewsDropdown = ({
  title,
  views,
  selected,
  onSelect,
  onNewCustomView,
}: CustomViewsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center border-none p-2 text-xl">
        {title}
        <ChevronDown
          strokeWidth={"3px"}
          className="ml-1 h-4 w-4 text-primary"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="-mt-2 ml-20">
        <ScrollArea className={views.length > 6 ? "h-72 w-52 rounded-md" : "w-52 rounded-md"}>
          {views.map((view) => (
            <DropdownMenuItem
              key={view.name}
              className="cursor-pointer pr-6 ps-4 focus:bg-primary focus:text-white"
              onClick={() => onSelect?.(view)}
            >
              {view.name}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="group ml-2 flex cursor-pointer gap-x-2 hover:text-primary"
          onClick={() => onNewCustomView?.()}
        >
          <PlusCircle className="h-4 w-4" />
          <span className="group-hover:text-primary">New Custom View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomViewsDropdown;
