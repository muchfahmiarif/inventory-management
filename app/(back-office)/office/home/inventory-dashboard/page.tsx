import BannerDashboard from "@/components/office/home/banner-dashboard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Ellipsis, FileText, Package } from "lucide-react";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="h-[200rem] bg-primary-foreground flex flex-col items-center">
      {/* TODO: CREATE FUNCTION DISABLE BANNER IF PAYMENT METHOD ALREADY SET */}
      {/* <BannerDashboard /> */}
      {/* Part 1 */}
      <div className="flex flex-row justify-between border-t max-w-screen-lg mx-4 gap-x-4 w-full">
        {/* Sales Activity */}
        <div className="border flex flex-col rounded-xl mt-10">
          <div className="bg-zinc-100 p-2">
            <h2 className="text-lg">Sales Activity</h2>
          </div>
          <div className="flex flex-row justify-center items-center m-4">
            <div className="flex flex-col px-4 ">
              <Button variant={"ghost"} size={"default"} className="mx-4 flex flex-col p-10">
                <h5 className="text-blue-500 text-4xl">0</h5>
                <p className="text-muted-foreground/60 text-xs">Qty</p>
              </Button>
              <div className="uppercase text-muted-foreground text-xs flex flex-row tracking-wider gap-x-2">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Check className="h-3 w-3" />
                </div>
                <p>To be packed</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4 ">
              <Button variant={"ghost"} size={"default"} className="mx-4 flex flex-col p-10">
                <h5 className="text-red-500 text-4xl">0</h5>
                <p className="text-muted-foreground/60 text-xs">Pkgs</p>
              </Button>
              <div className="uppercase text-muted-foreground text-xs flex flex-row tracking-wider gap-x-2">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Package className="h-3 w-3" />
                </div>
                <p>To be shipped</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4 ">
              <Button variant={"ghost"} size={"default"} className="mx-4 flex flex-col p-10">
                <h5 className="text-green-500 text-4xl">0</h5>
                <p className="text-muted-foreground/60 text-xs">Pkgs</p>
              </Button>
              <div className="uppercase text-muted-foreground text-xs flex flex-row tracking-wider gap-x-2">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Ellipsis className="h-3 w-3" />
                </div>
                <p>To be delivered</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4 ">
              <Button variant={"ghost"} size={"default"} className="mx-4 flex flex-col p-10">
                <h5 className="text-yellow-500 text-4xl">0</h5>
                <p className="text-muted-foreground/60 text-xs">Qty</p>
              </Button>
              <div className="uppercase text-muted-foreground text-xs flex flex-row tracking-wider gap-x-2">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <FileText className="h-3 w-3" />
                </div>
                <p>To be invoiced</p>
              </div>
            </div>
          </div>
        </div>
        {/* Inventory Summary */}
        <div className="flex flex-col border rounded-xl mt-10">
          <div className="bg-zinc-100 p-2">
            <h2 className="text-lg">Inventory Summary</h2>
          </div>
          <div className="flex flex-col mx-4">
            <div className="uppercase flex flex-row justify-between py-4 gap-x-8">
              <p className="text-muted-foreground/60 text-sm items-center justify-center flex">Quantity in hand</p>
              <p className="text-lg text-center items-center justify-center flex">0</p>
            </div>
            <Separator />
            <div className="uppercase flex flex-row justify-between py-4 gap-x-8">
              <p className="text-muted-foreground/60 text-sm items-center justify-center flex">Quantity to be received</p>
              <p className="text-lg text-center items-center justify-center flex">0</p>
            </div>
          </div>
        </div>
      </div>
      {/* Part 2 */}
      {/* Part 3 */}
      {/* Part 4 */}
    </div>
  );
};

export default DashboardPage;
