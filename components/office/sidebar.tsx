"use client";

import {
  BookCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  DollarSign,
  Home,
  NotepadText,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Unplug,
} from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOpen2, setIsOpen2] = React.useState(false);
  const [isOpen3, setIsOpen3] = React.useState(false);
  const pathname = usePathname();

  const inventoryLinks: Array<{ name: string; href: string }> = [
    {
      name: "Items",
      href: "/office/inventory/items",
    },
    {
      name: "Item Groups",
      href: "/office/inventory/itemgroups",
    },
    {
      name: "Inventory Adjustments",
      href: "/office/inventory/adjustments",
    },
  ];

  return (
    <div className="w-[12.5rem] bg-slate-800 text-slate-50 flex flex-col justify-between sticky top-0 h-screen">
      <div className="flex flex-col items-center justify-center">
        {/* Logo */}
        <Button className="flex gap-x-2 py-6 w-full justify-start bg-slate-900 hover:bg-slate-900 rounded-none text-lg">
          <ShoppingCart />
          <span>Inventory</span>
        </Button>

        {/* Top Part */}
        <ul className="flex flex-col w-full pt-3 gap-y-2">
          <li className="px-2">
            <Button className="w-full justify-start" variant={"default"} size={"sm"} onClick={() => (window.location.href = "/office/home")}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen3} onOpenChange={setIsOpen3}>
              <CollapsibleTrigger asChild>
                <Button
                  className={cn(isOpen3 ? "bg-slate-900" : "bg-transparent", "w-full flex flex-row justify-between hover:bg-slate-900")}
                  variant={"default"}
                  size={"sm"}>
                  <div className="flex items-center">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    <span>Inventory</span>
                  </div>
                  <div>{isOpen3 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {inventoryLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      className={cn(
                        pathname == link.href ? "bg-primary" : "bg-transparent",
                        "w-full justify-between ps-9 group text-wrap text-start"
                      )}
                      variant={"default"}
                      size={"sm"}>
                      <span>{link.name}</span>
                      <CirclePlus className="ml-2 h-4 w-4 hidden group-hover:block" />
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen2} onOpenChange={setIsOpen2}>
              <CollapsibleTrigger asChild>
                <Button className="w-full flex flex-row justify-between bg-transparent" variant={"default"} size={"sm"}>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Sales</span>
                  </div>
                  <div>{isOpen2 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Button className="w-full justify-between bg-transparent ps-9 group" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4 hidden group-hover:block" />
                </Button>
                <Button className="w-full justify-between bg-transparent ps-9 group" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4 hidden group-hover:block" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button className="w-full flex flex-row justify-between bg-transparent" variant={"default"} size={"sm"}>
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Purchases</span>
                  </div>
                  <div>{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Button className="w-full justify-between bg-transparent ps-9 group" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4 hidden group-hover:block" />
                </Button>
                <Button className="w-full justify-between bg-transparent ps-9 group" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4 hidden group-hover:block" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Button className="w-full justify-start bg-transparent" variant={"default"} size={"sm"}>
              <Unplug className="mr-2 h-4 w-4" />
              <span>Integration</span>
            </Button>
          </li>
          <li className="px-2">
            <Button className="w-full justify-start bg-transparent" variant={"default"} size={"sm"}>
              <NotepadText className="mr-2 h-4 w-4" />
              <span>Integration</span>
            </Button>
          </li>
          <li className="px-2">
            <Button className="w-full justify-start bg-transparent" variant={"default"} size={"sm"}>
              <BookCheck className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </Button>
          </li>
        </ul>
      </div>

      {/* Botton Part */}
      <div className="flex flex-col items-center justify-center">
        <div className="my-6 bg-slate-900 py-3 rounded-lg w-48">
          <div className="space-y-1 border-l-2 border-yellow-200 pl-2 ml-2">
            <p className="text-sm">
              Your <span className="font-bold">Premium</span> plan&apos;s trial expires in <span className="text-yellow-400">0 days</span>.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 items-center space-x-2 text-sm justify-center w-full">
            <Button size={"sm"} className="bg-transparent text-xs">
              Change plan
            </Button>
            <Separator orientation="vertical" />
            <Button size={"sm"} className="bg-transparent text-xs">
              Upgrade
            </Button>
          </div>
        </div>
        <Button variant={"ghost"} size={"icon"}>
          <ChevronLeft />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
