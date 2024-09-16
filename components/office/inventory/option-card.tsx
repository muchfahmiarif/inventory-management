import React from "react";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const OptionCardInventory = () => {
  const dataOptionCard: Array<{
    title: string;
    icon: string;
    description: string;
    button: string;
    enabled: boolean;
  }> = [
    {
      title: "Item Groups",
      icon: "item-groups",
      description:
        "Create multiple variants of the same item using Item Groups",
      button: "New Item Group",
      enabled: true,
    },
    {
      title: "Items",
      icon: "items",
      description: "Create standalone items and services that you buy and sell",
      button: "New Item",
      enabled: true,
    },
    {
      title: "Composite Items",
      icon: "composite-items",
      description: "Bundle different items together and sell them as kits",
      button: "New Composite Item",
      enabled: false,
    },
    {
      title: "Price Lists",
      icon: "price-lists",
      description:
        "Tweak your item prices for specific contacts or transactions",
      button: "New Price List",
      enabled: false,
    },
  ];

  return (
    <>
      {dataOptionCard.map((data) => (
        <div
          className="flex flex-col items-center justify-center gap-y-2 rounded-sm bg-white p-4 drop-shadow-lg"
          key={data.title}
        >
          <h3 className="font-semibold">{data.title}</h3>
          <Icon className="p-3" width={130} height={130} name={data.icon} />
          <p className="text-sm">{data.description}</p>
          {data.enabled ? (
            <Button size={"sm"} className="mb-6">
              {data.button}
            </Button>
          ) : (
            <Button size={"sm"} className="mb-6">
              Enable Now
            </Button>
          )}
        </div>
      ))}
    </>
  );
};

export default OptionCardInventory;
