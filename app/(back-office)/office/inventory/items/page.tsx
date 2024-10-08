"use client";

import React from "react";

import HeaderInventoryPage from "@/components/office/inventory/header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SwitchView from "@/components/office/inventory/switch-view";

const InventoryItemsPage = () => {
  const dataTitle: Array<{ name: string; href: string }> = [
    {
      name: "All Items",
      href: "/office/inventory/itemgroups",
    },
    {
      name: "Active Items",
      href: "/office/inventory/itemgroups/active",
    },
    {
      name: "Ungrouped Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Low Stock Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Sales",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Purchases",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Inventory Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Non Inventory Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Services",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Inactive Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Returned Items",
      href: "/office/inventory/itemgroups/inactive",
    },
    {
      name: "Non Returned Items",
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
          <DropdownMenuContent className="-mt-2 ml-20">
            <ScrollArea className="h-72 w-52 rounded-md">
              {dataTitle?.map((title) => (
                <DropdownMenuItem
                  key={title.name}
                  className="cursor-pointer pr-6 ps-4 focus:bg-primary focus:text-white"
                >
                  {title.name}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="group ml-2 flex cursor-pointer gap-x-2 hover:text-primary">
              <PlusCircle className="h-4 w-4" />
              <span className="group-hover:text-primary">New Custom View</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-row items-center gap-x-2">
          {/* TODO: CREATE FUNCTION ONCLICK TO NEW PAGE */}
          <Button className="flex flex-row" size={"sm"}>
            <Plus className="h-4 w-4" />
            <p>New</p>
          </Button>
          <SwitchView
            onClick={() => {
              true;
            }}
          />
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
      {/* TODO: IMPLEMENT STATE MANAGEMENT */}
      <div>test</div>
    </>
  );
};

export default InventoryItemsPage;
