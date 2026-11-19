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
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  RefreshCcw,
  Settings,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SwitchView from "@/components/shared/switch-view";
import useView from "@/store/useView";

const InventoryItemsPage = () => {
  const { push } = useRouter();
  const view = useView((state) => state.view);
  const setView = useView((state) => state.setView);

  const dataTitle: Array<{ name: string; href: string }> = [
    {
      name: "All Items",
      href: "/office/inventory/items",
    },
    {
      name: "Active Items",
      href: "/office/inventory/items?view=active",
    },
    {
      name: "Ungrouped Items",
      href: "/office/inventory/items?view=ungrouped",
    },
    {
      name: "Low Stock Items",
      href: "/office/inventory/items?view=low-stock",
    },
    {
      name: "Sales",
      href: "/office/inventory/items?view=sales",
    },
    {
      name: "Purchases",
      href: "/office/inventory/items?view=purchases",
    },
    {
      name: "Inventory Items",
      href: "/office/inventory/items?view=inventory",
    },
    {
      name: "Non Inventory Items",
      href: "/office/inventory/items?view=non-inventory",
    },
    {
      name: "Services",
      href: "/office/inventory/items?view=services",
    },
    {
      name: "Inactive Items",
      href: "/office/inventory/items?view=inactive",
    },
    {
      name: "Returned Items",
      href: "/office/inventory/items?view=returned",
    },
    {
      name: "Non Returned Items",
      href: "/office/inventory/items?view=non-returned",
    },
  ];

  return (
    <>
      <HeaderInventoryPage className="mr-20">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center border-none p-2 text-xl">
            All Items
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
          <Button
            className="flex flex-row"
            size={"sm"}
            onClick={() => push("/office/inventory/items/new")}
          >
            <Plus className="h-4 w-4" />
            <p>New</p>
          </Button>
          <SwitchView value={view} onChange={setView} />
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
                <span>Import Items</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4 text-primary" />
                <span>Export Items</span>
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
