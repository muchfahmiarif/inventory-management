"use client";

import { ChevronLeft, CirclePlus, Home, ShoppingCart } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOpen2, setIsOpen2] = React.useState(false);

  return (
    <div className="w-56 min-h-screen bg-slate-800 text-slate-50 flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center">
        {/* Logo */}
        <Button className="flex gap-x-2 py-6 w-full justify-start bg-slate-900 hover:bg-slate-900 rounded-none text-lg">
          <ShoppingCart />
          <span>Inventory</span>
        </Button>

        {/* Top Part */}
        <ul className="flex flex-col w-full pt-3 gap-y-2">
          <li className="px-2">
            <Button className="w-full justify-start" variant={"default"} size={"sm"}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
          </li>
          <li className="px-2">
            <Button className="w-full justify-start" variant={"default"} size={"sm"}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen2} onOpenChange={setIsOpen2}>
              <CollapsibleTrigger asChild>
                <Button className="w-full justify-start" variant={"default"} size={"sm"}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Button className="w-full justify-start" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
          <li className="px-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button className="w-full justify-start" variant={"default"} size={"sm"}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Button className="w-full justify-start" variant={"default"} size={"sm"}>
                  <span>Home</span>
                  <CirclePlus className="ml-2 h-4 w-4" />
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
      </div>

      {/* Botton Part */}
      <div className="flex items-center justify-center py-4">
        <Button variant={"ghost"} size={"icon"}>
          <ChevronLeft />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
