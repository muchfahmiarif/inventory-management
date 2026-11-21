"use client";

import { Building2 } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import background from "@/public/background-inventory.svg";
import { cn } from "@/lib/utils";

const NavbarHomePage = () => {
  const pathname = usePathname();
  console.log(pathname);
  const navLink: Array<{ title: string; href: string }> = [
    { title: "Dashboard", href: "/office/home/inventory-dashboard" },
    { title: "Getting Started", href: "/office/home/getting-started" },
    { title: "Recent Updates", href: "/office/home/recent-updates" },
    { title: "Announcements", href: "/office/home/announcements" },
  ];

  return (
    <div className="relative sticky -top-8 flex h-32 flex-col border-b bg-slate-50 dark:bg-card">
      {/* Decorative pattern — light mode only */}
      <div
        aria-hidden
        className="absolute inset-0 bg-repeat-x dark:hidden"
        style={{ backgroundImage: `url(${background.src})` }}
      />
      <div className="relative mx-4 mt-7 flex flex-row items-center justify-between">
        <div className="flex items-center justify-center">
          <div className="rounded-lg border bg-white p-[0.85rem] text-muted-foreground dark:bg-muted">
            <Building2 className="h-5 w-5 stroke-1" />
          </div>
          <div className="ml-2 flex flex-col">
            <div className="text-lg font-medium">Hello, Fahmi Arif G</div>
            <div className="text-xs text-muted-foreground">Genero</div>
          </div>
        </div>
        <div>
          {/* <Button variant={"ghost"} size={"icon"} className="hover:bg-muted hover:border-2">
            <CircleAlert className="h-6 w-6" />
          </Button> */}
        </div>
      </div>

      <nav className="relative flex flex-row gap-x-5 px-3 pt-5 text-[0.92rem]">
        {/**
         * TODO: This is the sidebar navigation for the back-office homepage.
         */}
        {navLink.map((link) => (
          <Link
            href={link.href}
            key={link.title}
            className={cn(
              pathname === link.href
                ? "border-b-2 border-b-primary text-foreground"
                : "text-muted-foreground",
              "pb-2 hover:text-foreground",
            )}
          >
            {link.title}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default NavbarHomePage;
