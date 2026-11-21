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
  type LucideIcon,
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

interface SidebarLink {
  name: string;
  href: string;
  new?: string;
}

interface NavSectionProps {
  icon: LucideIcon;
  label: string;
  /** Route prefixes that mark this section and its children as active */
  bases: string[];
  links: SidebarLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Slim orange indicator pill shown on the left edge of the active row */
const ActiveRail = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary",
      className,
    )}
  />
);

const ChildLink = ({ link, active }: { link: SidebarLink; active: boolean }) => {
  return (
    <div className="group relative flex w-full">
      {active && <ActiveRail className="left-0" />}
      <Button
        className={cn(
          "flex-1 justify-start text-start text-wrap ps-9 hover:bg-sidebar-accent/60",
          active ? "bg-sidebar-accent font-medium" : "bg-transparent",
        )}
        variant={"default"}
        size={"sm"}
        asChild
      >
        <Link href={link.href} aria-current={active ? "page" : undefined}>
          <span>{link.name}</span>
        </Link>
      </Button>
      {link.new && (
        <Button
          className="bg-transparent px-2 hover:bg-transparent"
          variant={"default"}
          size={"sm"}
          asChild
        >
          <Link href={link.new} aria-label={`New ${link.name}`}>
            <CirclePlus className="hidden h-4 w-4 group-hover:block" />
          </Link>
        </Button>
      )}
    </div>
  );
};

const NavSection = ({
  icon: Icon,
  label,
  bases,
  links,
  open,
  onOpenChange,
}: NavSectionProps) => {
  const pathname = usePathname();
  const active = bases.some((base) => pathname.startsWith(base));

  return (
    <li className="relative px-2">
      {/* Rail sits on the trigger row (h-9), not the center of the whole expanded li */}
      {active && <ActiveRail className="left-2 top-[18px]" />}
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <Button
            className={cn(
              "flex w-full flex-row justify-between hover:bg-sidebar-accent",
              active ? "bg-sidebar-accent font-medium" : "bg-transparent",
            )}
            variant={"default"}
            size={"sm"}
          >
            <div className="flex items-center">
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </div>
            <div>
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {links.map((link) => (
            <ChildLink
              key={link.href}
              link={link}
              active={pathname.startsWith(link.href)}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

const Sidebar = () => {
  const pathname = usePathname();

  // Auto-expand the section containing the current route
  const [isPurchasesOpen, setIsPurchasesOpen] = React.useState(
    pathname.startsWith("/office/purchases"),
  );
  const [isSalesOpen, setIsSalesOpen] = React.useState(
    pathname.startsWith("/office/sales"),
  );
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(
    ["/office/inventory", "/office/stock-counts", "/office/transfers"].some(
      (base) => pathname.startsWith(base),
    ),
  );

  const inventoryLinks: SidebarLink[] = [
    { name: "Items", href: "/office/inventory/items", new: "/office/inventory/items/new" },
    { name: "Item Groups", href: "/office/inventory/itemgroups", new: "/office/inventory/itemgroups/new" },
    { name: "Composite Items", href: "/office/inventory/composite-items", new: "/office/inventory/composite-items/new" },
    { name: "Price Lists", href: "/office/inventory/price-lists", new: "/office/inventory/price-lists/new" },
    { name: "Inventory Adjustments", href: "/office/inventory/adjustments", new: "/office/inventory/adjustments/new" },
    { name: "Stock Counts", href: "/office/stock-counts", new: "/office/stock-counts/new" },
    { name: "Transfer Orders", href: "/office/transfers", new: "/office/transfers/new" },
  ];

  const salesLinks: SidebarLink[] = [
    { name: "Customers", href: "/office/sales/customers", new: "/office/sales/customers/new" },
    { name: "Estimates", href: "/office/sales/estimates", new: "/office/sales/estimates/new" },
    { name: "Sales Orders", href: "/office/sales/sales-orders", new: "/office/sales/sales-orders/new" },
    { name: "Invoices", href: "/office/sales/invoices", new: "/office/sales/invoices/new" },
    { name: "Deliver Challans", href: "/office/sales/deliver-challans", new: "/office/sales/deliver-challans/new" },
    { name: "Customer Payments", href: "/office/sales/customer-payments" },
  ];

  const purchaseLinks: SidebarLink[] = [
    { name: "Vendors", href: "/office/purchases/vendors", new: "/office/purchases/vendors/new" },
  ];

  return (
    <div className="sticky top-0 flex h-screen w-[12.5rem] flex-col justify-between bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col items-center justify-center">
        {/* Logo */}
        <Button className="flex w-full justify-start gap-x-2 rounded-none bg-sidebar-accent py-6 text-lg hover:bg-sidebar-accent">
          <ShoppingCart />
          <span>Inventory</span>
        </Button>

        {/* Top Part */}
        <ul className="flex w-full flex-col gap-y-2 pt-3">
          <li className="px-2">
            <Button
              className={cn(
                pathname.startsWith("/office/home") ? "bg-primary" : "bg-transparent",
                "w-full justify-start hover:bg-sidebar-accent",
              )}
              variant={"default"}
              size={"sm"}
              asChild
            >
              <Link href="/office/home" aria-current={pathname.startsWith("/office/home") ? "page" : undefined}>
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
          </li>
          <NavSection
            icon={ShoppingBasket}
            label="Inventory"
            bases={["/office/inventory", "/office/stock-counts", "/office/transfers"]}
            links={inventoryLinks}
            open={isInventoryOpen}
            onOpenChange={setIsInventoryOpen}
          />
          <NavSection
            icon={DollarSign}
            label="Sales"
            bases={["/office/sales"]}
            links={salesLinks}
            open={isSalesOpen}
            onOpenChange={setIsSalesOpen}
          />
          <NavSection
            icon={ShoppingBag}
            label="Purchases"
            bases={["/office/purchases"]}
            links={purchaseLinks}
            open={isPurchasesOpen}
            onOpenChange={setIsPurchasesOpen}
          />
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent hover:bg-sidebar-accent"
              variant={"default"}
              size={"sm"}
            >
              <Unplug className="mr-2 h-4 w-4" />
              <span>Integration</span>
            </Button>
          </li>
          <li className="relative px-2">
            {pathname.startsWith("/office/warehouse") && (
              <ActiveRail className="left-2" />
            )}
            <Button
              className={cn(
                "w-full justify-start hover:bg-sidebar-accent",
                pathname.startsWith("/office/warehouse")
                  ? "bg-sidebar-accent font-medium"
                  : "bg-transparent",
              )}
              variant={"default"}
              size={"sm"}
              asChild
            >
              <Link
                href="/office/warehouse"
                aria-current={pathname.startsWith("/office/warehouse") ? "page" : undefined}
              >
                <Warehouse className="mr-2 h-4 w-4" />
                <span>Warehouses</span>
              </Link>
            </Button>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent hover:bg-sidebar-accent"
              variant={"default"}
              size={"sm"}
            >
              <NotepadText className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </Button>
          </li>
          <li className="px-2">
            <Button
              className="w-full justify-start bg-transparent hover:bg-sidebar-accent"
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
        <div className="my-6 w-48 rounded-lg bg-sidebar-accent py-3">
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
