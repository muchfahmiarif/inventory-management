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

import HeaderInventoryPage from "@/components/office/inventory/header";
import OptionCardInventory from "@/components/office/inventory/option-card";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const InventoryItemGroupsPage = () => {
  const dataTitle: Array<{ name: string; href: string }> = [
    {
      name: "All Item Groups",
      href: "/office/inventory/itemgroups",
    },
    {
      name: "Active Item Groups",
      href: "/office/inventory/itemgroups/active",
    },
    {
      name: "Inactive Item Groups",
      href: "/office/inventory/itemgroups/inactive",
    },
  ];

  return (
    <>
      <HeaderInventoryPage className="mr-20">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center border-none p-2 text-xl">
            All Item Groups
            <ChevronDown
              strokeWidth={"3px"}
              className="ml-1 h-4 w-4 text-primary"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="-mt-2 ml-5">
            {dataTitle?.map((title) => (
              <DropdownMenuItem
                key={title.name}
                className="cursor-pointer pr-6 ps-4 focus:bg-primary focus:text-white"
              >
                {title.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-row items-center gap-x-2">
          <Toggle variant={"outline"} size={"sm"}>
            <Tooltip>
              <TooltipTrigger>
                <List className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle List View</p>
              </TooltipContent>
            </Tooltip>
          </Toggle>
          <Button className="flex flex-row" size={"sm"}>
            <Plus className="h-4 w-4" />
            <p>New</p>
          </Button>
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
      </HeaderInventoryPage>
      <div className="mx-10 grid grid-cols-2 items-center justify-center gap-5 p-4">
        <OptionCardInventory />
      </div>
    </>
  );
};

export default InventoryItemGroupsPage;
