import React from "react";

import HeaderInventoryPage from "@/components/office/inventory/header";
import OptionCardInventory from "@/components/office/inventory/option-card";
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
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
          <DropdownMenuTrigger className="flex items-center text-xl p-2 border-none">
            All Item Groups
            <ChevronDown strokeWidth={"3px"} className="h-4 w-4 text-primary ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ml-5 -mt-2">
            {dataTitle?.map((title) => (
              <DropdownMenuItem key={title.name} className="cursor-pointer focus:bg-primary focus:text-white ps-4 pr-6">
                {title.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-row gap-x-2 items-center">
          <Toggle variant={"outline"} size={"sm"}>
            <Tooltip>
              <TooltipTrigger>
                <List className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle List View</p>
              </TooltipContent>
            </Tooltip>
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
      </HeaderInventoryPage>
      <div className="grid grid-cols-2 justify-center items-center p-4 gap-5 mx-10">
        <OptionCardInventory />
      </div>
    </>
  );
};

export default InventoryItemGroupsPage;
