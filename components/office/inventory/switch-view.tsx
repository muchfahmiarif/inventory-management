"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import React from "react";

enum SwitchOptions {
  OPTION1 = "list",
  OPTION2 = "grid",
}

interface SwitchViewProps {
  onClick: () => void;
}

const SwitchView = ({ onClick }: SwitchViewProps) => {
  const [activeOption, setActiveOption] = React.useState<SwitchOptions>(SwitchOptions.OPTION1);
  const handleSwitchClick = (option: SwitchOptions) => {
    setActiveOption(option);
    // console.log("Option selected: ", option);
  };

  return (
    <>
      <div className="flex bg-black items-center rounded-lg w-max h-max">
        <div
          className={cn(activeOption !== SwitchOptions.OPTION1 ? "cursor-pointer" : "", "rounded-l-lg h-9 w-10 flex items-center justify-center p-2")}
          style={{
            backgroundColor: activeOption === SwitchOptions.OPTION1 ? "grey" : "transparent",
          }}
          onClick={() => handleSwitchClick(SwitchOptions.OPTION1)}>
          <div className={"text-white"}>
            <List className="h-4 w-4" />
          </div>
        </div>
        <div
          className={cn(activeOption !== SwitchOptions.OPTION2 ? "cursor-pointer" : "", "rounded-r-lg h-9 w-10 flex items-center justify-center p-2")}
          style={{
            backgroundColor: activeOption === SwitchOptions.OPTION2 ? "grey" : "transparent",
          }}
          onClick={() => handleSwitchClick(SwitchOptions.OPTION2)}>
          <div className={"text-white"}>
            <LayoutGrid className="h-4 w-4" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SwitchView;
