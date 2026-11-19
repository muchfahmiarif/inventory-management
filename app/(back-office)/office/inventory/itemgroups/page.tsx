"use client";

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
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  RefreshCcw,
  Settings,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

import HeaderInventoryPage from "@/components/office/inventory/header";
import OptionCardInventory from "@/components/office/inventory/option-card";
import SwitchView from "@/components/shared/switch-view";
import useView from "@/store/useView";
import { Button } from "@/components/ui/button";

const InventoryItemGroupsPage = () => {
  const { push } = useRouter();
  const view = useView((state) => state.view);
  const setView = useView((state) => state.setView);

  const dataTitle: Array<{ name: string; href: string }> = [
    {
      name: "All Item Groups",
      href: "/office/inventory/itemgroups",
    },
    {
      name: "Active Item Groups",
      href: "/office/inventory/itemgroups?view=active",
    },
    {
      name: "Inactive Item Groups",
      href: "/office/inventory/itemgroups?view=inactive",
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
          <SwitchView value={view} onChange={setView} />
          <Button
            className="flex flex-row"
            size={"sm"}
            onClick={() => push("/office/inventory/itemgroups/new")}
          >
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
