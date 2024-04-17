import { Building2 } from "lucide-react";
import React from "react";

import background from "@/public/background-inventory.svg";

const NavbarHomePage = () => {
  return (
    <div className="h-32 flex flex-col bg-repeat-x bg-slate-50" style={{ backgroundImage: `url(${background.src})`, width: "100%", height: "100%" }}>
      <div className="flex flex-row items-center justify-between mx-4 mt-7 z-10">
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

      <ul className="flex flex-row pt-5 px-3 gap-x-5 text-[0.92rem] z-10">
        {/**
         * TODO: This is the sidebar navigation for the back-office homepage.
         */}
        <li className="border-b-2 border-b-primary pb-2">Dashboard</li>
        <li className="border-b-2 border-b-primary pb-2">Getting Started</li>
        <li className="border-b-2 border-b-primary pb-2">Announcement</li>
        <li className="border-b-2 border-b-primary pb-2">Recent Updates</li>
      </ul>
    </div>
  );
};

export default NavbarHomePage;
