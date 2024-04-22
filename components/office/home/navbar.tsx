"use client";

import { Building2 } from "lucide-react";
import React from "react";

import background from "@/public/background-inventory.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div
      className="h-32 flex flex-col bg-repeat-x bg-slate-50 border-b"
      style={{ backgroundImage: `url(${background.src})`, width: "100%", height: "100%" }}>
      <div className="flex flex-row items-center justify-between mx-4 mt-7 ">
        <div className="flex items-center justify-center">
          <div className="bg-white border text-muted-foreground p-[0.85rem] rounded-lg">
            <Building2 className="h-5 w-5 stroke-1" />
          </div>
          <div className="flex flex-col ml-2">
            <div className="font-medium text-lg">Hello, Fahmi Arif G</div>
            <div className="text-muted-foreground text-xs">Genero</div>
          </div>
        </div>
        <div>
          {/* <Button variant={"ghost"} size={"icon"} className="hover:bg-muted hover:border-2">
            <CircleAlert className="h-6 w-6" />
          </Button> */}
        </div>
      </div>

      <nav className="flex flex-row pt-5 px-3 gap-x-5 text-[0.92rem] ">
        {/**
         * TODO: This is the sidebar navigation for the back-office homepage.
         */}
        {navLink.map((link) => (
          <Link href={link.href} key={link.title} className={pathname === link.href ? "border-b-2 border-b-primary pb-2" : "pb-2"}>
            {link.title}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default NavbarHomePage;
