import React from "react";

import HeaderInventoryPage from "@/components/office/inventory/header";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const InventoryItemGroupsPage = () => {
  return (
    <>
      <HeaderInventoryPage className="mr-20" />
      <div className="grid grid-cols-2 justify-center items-center p-4 gap-5 mx-10">
        {/* Item Groups */}
        <div className="flex flex-col justify-center items-center drop-shadow-lg bg-white rounded-sm gap-y-2 p-4">
          <h3 className="font-semibold">Item Group</h3>
          <Icon className="p-3" width={130} height={130} name="item-groups" />
          <p className="text-sm">Create multiple variants of the same item using Item Groups</p>
          <Button size={"sm"} className="mb-6">
            New Item Group
          </Button>
        </div>
        {/* Items */}
        <div className="flex flex-col justify-center items-center drop-shadow-lg bg-white rounded-sm gap-y-2 p-4">
          <h3 className="font-semibold">Items</h3>
          <Icon className="p-3" width={130} height={130} name="items" />
          <p className="text-sm">Create standalone items and services that you buy and sell</p>
          <Button size={"sm"} className="mb-6">
            New Item
          </Button>
        </div>
        {/* Composite Items */}
        <div className="flex flex-col justify-center items-center drop-shadow-lg bg-white rounded-sm gap-y-2 p-4">
          <h3 className="font-semibold">Composite Items</h3>
          <Icon className="p-3" width={130} height={130} name="composite-items" />
          <p className="text-sm">Bundle different items together and sell them as kits</p>
          <Button size={"sm"} className="mb-6">
            New Composite Item
          </Button>
        </div>
        {/* Price List */}
        <div className="flex flex-col justify-center items-center drop-shadow-lg bg-white rounded-sm gap-y-2 p-4">
          <h3 className="font-semibold">Price Lists</h3>
          <Icon className="p-3" width={130} height={130} name="price-lists" />
          <p className="text-sm">Tweak your item prices for specific contacts or transactions</p>
          <Button size={"sm"} className="mb-6">
            New Price List
          </Button>
        </div>
      </div>
    </>
  );
};

export default InventoryItemGroupsPage;
