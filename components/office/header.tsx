import {
  Bell,
  ChevronDown,
  History,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ThemeToggle from "../ui/theme-toggle";
import { CommandPalette } from "@/components/office/command-palette";
import { NotificationsMenu } from "@/components/office/notifications-menu";
import SearchInput from "@/components/office/search-input";

const QUICK_CREATE = [
  { label: "Item", href: "/office/inventory/items/new" },
  { label: "Customer", href: "/office/sales/customers/new" },
  { label: "Estimate", href: "/office/sales/estimates/new" },
  { label: "Sales Order", href: "/office/sales/sales-orders/new" },
  { label: "Invoice", href: "/office/sales/invoices/new" },
  { label: "Purchase Order", href: "/office/purchases/purchase-orders/new" },
  { label: "Expense", href: "/office/purchases/expenses/new" },
];

export default function HeaderComponents() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-slate-100 py-1 dark:bg-card/95 dark:backdrop-blur-sm">
      {/* Left Side */}
      <div className="mx-4 flex gap-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={"ghost"} size={"icon"} asChild>
                <Link href="/office/home/recent-updates" aria-label="Recent activity">
                  <History size={20} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recent Activity</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div>
          <SearchInput />
        </div>
      </div>

      {/* Right Side */}
      <div className="mx-4 flex gap-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="link"
              className="text-muted-foreground hover:no-underline"
            >
              Personal
              <ChevronDown size={20} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/office/settings/users">Users & Roles</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/office/home/recent-updates">Recent Updates</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/office/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <TooltipProvider>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="bg-primary/70 hover:bg-primary/90"
                    aria-label="Quick Create"
                  >
                    <Plus size={16} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Create</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {QUICK_CREATE.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
        <div className="flex flex-row">
          <Button variant={"ghost"} size={"icon"} asChild>
            <Link href="/office/sales/customers" aria-label="Contacts">
              <Users size={16} />
            </Link>
          </Button>
          <NotificationsMenu />
          <Button variant={"ghost"} size={"icon"} asChild>
            <Link href="/office/settings" aria-label="Settings">
              <Settings size={16} />
            </Link>
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mx-2 rounded-full outline-none ring-primary focus-visible:ring-2"
              aria-label="Profile menu"
            >
              <Avatar>
                <AvatarImage />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">Fahmi Arif G</p>
              <p className="text-xs font-normal text-muted-foreground">
                Genero
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/office/settings/organization">Organization Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/office/settings/users">Users & Roles</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/office/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant={"ghost"} size={"icon"} asChild>
          <Link href="/office/home/inventory-dashboard" aria-label="Dashboard">
            <LayoutGrid size={20} />
          </Link>
        </Button>
      </div>
      <CommandPalette />
    </div>
  );
}
