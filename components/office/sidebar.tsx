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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    <div className="sticky top-0 flex h-screen w-[12.5rem] flex-col justify-between bg-slate-800 text-slate-50">
      <div className="flex flex-col items-center justify-center">
        {/* Logo */}
        <Button className="flex w-full justify-start gap-x-2 rounded-none bg-slate-900 py-6 text-lg hover:bg-slate-900">
          <ShoppingCart />
          <span>Inventory</span>
        </Button>

        {/* Top Part */}
        <ul className="flex w-full flex-col gap-y-2 pt-3">
          <li className="px-2">
            <Button
              className="w-full justify-start"
              variant={"default"}
              size={"sm"}
              onClick={() => (window.location.href = "/office/home")}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen3} onOpenChange={setIsOpen3}>
              <CollapsibleTrigger asChild>
                <Button
                  className={cn(
                    isOpen3 ? "bg-slate-900" : "bg-transparent",
                    "flex w-full flex-row justify-between hover:bg-slate-900",
                  )}
                  variant={"default"}
                  size={"sm"}
                >
                  <div className="flex items-center">
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    <span>Inventory</span>
                  </div>
                  <div>
                    {isOpen3 ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {inventoryLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      className={cn(
                        pathname == link.href ? "bg-primary" : "bg-transparent",
                        "group w-full justify-between text-wrap ps-9 text-start",
                      )}
                      variant={"default"}
                      size={"sm"}
                    >
                      <span>{link.name}</span>
                      <CirclePlus className="ml-2 hidden h-4 w-4 group-hover:block" />
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen2} onOpenChange={setIsOpen2}>
              <CollapsibleTrigger asChild>
                <Button
                  className="flex w-full flex-row justify-between bg-transparent"
                  variant={"default"}
                  size={"sm"}
                >
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Sales</span>
                  </div>
                  <div>
                    {isOpen2 ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Button
                  className="group w-full justify-between bg-transparent ps-9"
                  variant={"default"}
                  size={"sm"}
                >
                  <span>Home</span>
                  <CirclePlus className="ml-2 hidden h-4 w-4 group-hover:block" />
                </Button>
                <Button
                  className="group w-full justify-between bg-transparent ps-9"
                  variant={"default"}
                  size={"sm"}
                >
                  <span>Home</span>
                  <CirclePlus className="ml-2 hidden h-4 w-4 group-hover:block" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  className="flex w-full flex-row justify-between bg-transparent"
                  variant={"default"}
                  size={"sm"}
                >
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Purchases</span>
                  </div>
                  <div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Button
                  className="group w-full justify-between bg-transparent ps-9"
                  variant={"default"}
                  size={"sm"}
                >
                  <span>Home</span>
                  <CirclePlus className="ml-2 hidden h-4 w-4 group-hover:block" />
                </Button>
                <Button
                  className="group w-full justify-between bg-transparent ps-9"
                  variant={"default"}
                  size={"sm"}
                >
                  <span>Home</span>
                  <CirclePlus className="ml-2 hidden h-4 w-4 group-hover:block" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent"
              variant={"default"}
              size={"sm"}
            >
              <Unplug className="mr-2 h-4 w-4" />
              <span>Integration</span>
            </Button>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent"
              variant={"default"}
              size={"sm"}
            >
              <NotepadText className="mr-2 h-4 w-4" />
              <span>Integration</span>
            </Button>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent"
              variant={"default"}
              size={"sm"}
            >
              <BookCheck className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </Button>
          </li>
        </ul>
      </div>

      {/* Botton Part */}
      <div className="flex flex-col items-center justify-center">
        <div className="my-6 w-48 rounded-lg bg-slate-900 py-3">
          <div className="ml-2 space-y-1 border-l-2 border-yellow-200 pl-2">
            <p className="text-sm">
              Your <span className="font-bold">Premium</span> plan&apos;s trial
              expires in <span className="text-yellow-400">0 days</span>.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 w-full items-center justify-center space-x-2 text-sm">
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
