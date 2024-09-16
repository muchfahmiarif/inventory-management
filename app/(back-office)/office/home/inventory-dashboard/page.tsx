import BannerDashboard from "@/components/office/home/banner-dashboard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Ellipsis, FileText, Package } from "lucide-react";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="flex h-[200rem] flex-col items-center bg-primary-foreground">
      {/* TODO: CREATE FUNCTION DISABLE BANNER IF PAYMENT METHOD ALREADY SET */}
      {/* <BannerDashboard /> */}
      {/* Part 1 */}
      <div className="mx-4 flex w-full max-w-screen-lg flex-row justify-between gap-x-4">
        {/* Sales Activity */}
        <div className="mt-10 flex flex-col rounded-xl border">
          <div className="bg-zinc-100 p-2">
            <h2 className="text-lg">Sales Activity</h2>
          </div>
          <div className="m-4 flex flex-row items-center justify-center">
            <div className="flex flex-col px-4">
              <Button
                variant={"ghost"}
                size={"default"}
                className="mx-4 flex flex-col p-10"
              >
                <h5 className="text-4xl text-blue-500">0</h5>
                <p className="text-xs text-muted-foreground/60">Qty</p>
              </Button>
              <div className="flex flex-row gap-x-2 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Check className="h-3 w-3" />
                </div>
                <p>To be packed</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4">
              <Button
                variant={"ghost"}
                size={"default"}
                className="mx-4 flex flex-col p-10"
              >
                <h5 className="text-4xl text-red-500">0</h5>
                <p className="text-xs text-muted-foreground/60">Pkgs</p>
              </Button>
              <div className="flex flex-row gap-x-2 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Package className="h-3 w-3" />
                </div>
                <p>To be shipped</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4">
              <Button
                variant={"ghost"}
                size={"default"}
                className="mx-4 flex flex-col p-10"
              >
                <h5 className="text-4xl text-green-500">0</h5>
                <p className="text-xs text-muted-foreground/60">Pkgs</p>
              </Button>
              <div className="flex flex-row gap-x-2 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <Ellipsis className="h-3 w-3" />
                </div>
                <p>To be delivered</p>
              </div>
            </div>
            <Separator orientation={"vertical"} />
            <div className="flex flex-col px-4">
              <Button
                variant={"ghost"}
                size={"default"}
                className="mx-4 flex flex-col p-10"
              >
                <h5 className="text-4xl text-yellow-500">0</h5>
                <p className="text-xs text-muted-foreground/60">Qty</p>
              </Button>
              <div className="flex flex-row gap-x-2 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="rounded-full border border-muted-foreground p-[0.125rem]">
                  <FileText className="h-3 w-3" />
                </div>
                <p>To be invoiced</p>
              </div>
            </div>
          </div>
        </div>
        {/* Inventory Summary */}
        <div className="mt-10 flex flex-col rounded-xl border">
          <div className="bg-zinc-100 p-2">
            <h2 className="text-lg">Inventory Summary</h2>
          </div>
          <div className="mx-4 flex flex-col">
            <div className="flex flex-row justify-between gap-x-8 py-4 uppercase">
              <p className="flex items-center justify-center text-sm text-muted-foreground/60">
                Quantity in hand
              </p>
              <p className="flex items-center justify-center text-center text-lg">
                0
              </p>
            </div>
            <Separator />
            <div className="flex flex-row justify-between gap-x-8 py-4 uppercase">
              <p className="flex items-center justify-center text-sm text-muted-foreground/60">
                Quantity to be received
              </p>
              <p className="flex items-center justify-center text-center text-lg">
                0
              </p>
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
