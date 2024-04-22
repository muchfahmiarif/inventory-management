"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coins, X } from "lucide-react";
import React from "react";

const BannerDashboard = () => {
  // TODO: Implement the logic if online payments are set, will be closed by default
  const [enabled, setEnabled] = React.useState(false);

  return (
    <div className={cn(enabled ? "hidden" : "flex", "p-8 flex-row justify-between gap-x-12 bg-primary-foreground")}>
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
        <Button onClick={() => setEnabled(true)} variant={"secondary"} size={"icon"} className="mx-3">
          <X className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};

export default BannerDashboard;
