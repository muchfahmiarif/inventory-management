import { History, Search } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

const HeaderComponents = () => {
  return (
    <div className="flex items-center justify-between bg-slate-200">
      <div className="mx-4 my-2 flex gap-x-2">
        <Button variant={"ghost"} size={"icon"}>
          <History />
        </Button>
        <div>
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="border text-sm rounded-lg block w-full ps-10 p-2 hover:border-primary focus:border-primary"
              placeholder="Search in Customers ( / )"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
      <div>Navigation</div>
    </div>
  );
};

export default HeaderComponents;
