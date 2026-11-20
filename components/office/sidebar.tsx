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
  Warehouse,
} from "lucide-react";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();

  const inventoryLinks: Array<{ name: string; href: string; new: string }> = [
    {
      name: "Items",
      href: "/office/inventory/items",
      new: "/office/inventory/items/new",
    },
    {
      name: "Item Groups",
      href: "/office/inventory/itemgroups",
      new: "/office/inventory/itemgroups/new",
    },
    {
      name: "Composite Items",
      href: "/office/inventory/composite-items",
      new: "/office/inventory/composite-items/new",
    },
    {
      name: "Price Lists",
      href: "/office/inventory/price-lists",
      new: "/office/inventory/price-lists/new",
    },
    {
      name: "Inventory Adjustments",
      href: "/office/inventory/adjustments",
      new: "/office/inventory/adjustments/new",
    },
    {
      name: "Stock Counts",
      href: "/office/stock-counts",
      new: "/office/stock-counts/new",
    },
    {
      name: "Transfer Orders",
      href: "/office/transfers",
      new: "/office/transfers/new",
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
              className={cn(
                pathname.startsWith("/office/home") ? "bg-primary" : "bg-transparent",
                "w-full justify-start",
              )}
              variant={"default"}
              size={"sm"}
              asChild
            >
              <Link href="/office/home">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Link>
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
                  <div key={link.href} className="group flex w-full">
                    <Button
                      className={cn(
                        pathname === link.href ? "bg-primary" : "bg-transparent",
                        "flex-1 justify-start text-wrap ps-9 text-start",
                      )}
                      variant={"default"}
                      size={"sm"}
                      asChild
                    >
                      <Link href={link.href}>
                        <span>{link.name}</span>
                      </Link>
                    </Button>
                    <Button
                      className={cn(
                        pathname === link.href ? "bg-primary" : "bg-transparent",
                        "px-2",
                      )}
                      variant={"default"}
                      size={"sm"}
                      asChild
                    >
                      <Link href={link.new} aria-label={`New ${link.name}`}>
                        <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                      </Link>
                    </Button>
                  </div>
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
                <div className="group flex w-full">
                  <Button
                    className="flex-1 justify-start bg-transparent ps-9"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/customers">
                      <span>Customers</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-transparent px-2"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/customers/new" aria-label="New Customer">
                      <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                    </Link>
                  </Button>
                </div>
                <div className="group flex w-full">
                  <Button
                    className="flex-1 justify-start bg-transparent ps-9"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/estimates">
                      <span>Estimates</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-transparent px-2"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/estimates/new" aria-label="New Estimate">
                      <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                    </Link>
                  </Button>
                </div>
                <div className="group flex w-full">
                  <Button
                    className="flex-1 justify-start bg-transparent ps-9"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/sales-orders">
                      <span>Sales Orders</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-transparent px-2"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/sales-orders/new" aria-label="New Sales Order">
                      <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                    </Link>
                  </Button>
                </div>
                <div className="group flex w-full">
                  <Button
                    className="flex-1 justify-start bg-transparent ps-9"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/invoices">
                      <span>Invoices</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-transparent px-2"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/sales/invoices/new" aria-label="New Invoice">
                      <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                    </Link>
                  </Button>
                </div>
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
                <div className="group flex w-full">
                  <Button
                    className="flex-1 justify-start bg-transparent ps-9"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/purchases/vendors">
                      <span>Vendors</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-transparent px-2"
                    variant={"default"}
                    size={"sm"}
                    asChild
                  >
                    <Link href="/office/purchases/vendors/new" aria-label="New Vendor">
                      <CirclePlus className="hidden h-4 w-4 group-hover:block" />
                    </Link>
                  </Button>
                </div>
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
              onClick={() => router.push("/office/warehouse")}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              <span>Warehouses</span>
            </Button>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent"
              variant={"default"}
              size={"sm"}
            >
              <NotepadText className="mr-2 h-4 w-4" />
              <span>Reports</span>
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
