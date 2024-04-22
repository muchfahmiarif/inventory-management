import { Button } from "@/components/ui/button";
import { Coins, X } from "lucide-react";
import React from "react";

const BannerDashboard = () => {
  return (
    <div className="p-8 flex flex-row justify-between gap-x-12 bg-primary-foreground">
      <div className="flex flex-row">
        <div className="m-6 mr-12">
          <Coins className="h-16 w-16 text-primary" />
        </div>
        <div className="flex flex-col justify-center gap-y-3">
          <h2 className="font-bold text-3xl tracking-wide">Start accepting online payments</h2>
          <p className="text-muted-foreground text-wrap text-lg max-w-[50rem]">
            Businesses are moving towards online payments as they&apos;re easy, secure and fast. Try them for your business today.
          </p>
        </div>
      </div>
      <div className="flex flex-row gap-40">
        <div className="flex justify-center items-center">
          <Button variant={"default"} size={"lg"} className="text-lg">
            Enable
          </Button>
        </div>
        <Button variant={"secondary"} size={"icon"} className="mx-3">
          <X className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};

export default BannerDashboard;
