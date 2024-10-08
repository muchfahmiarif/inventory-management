import {
  Bell,
  ChevronDown,
  History,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SearchInput from "@/components/office/search-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ThemeToggle from "../ui/theme-toggle";

const HeaderComponents = () => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-slate-100 py-1">
      {/* Left Side */}
      <div className="mx-4 flex gap-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <History size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recent Activity</p>
          </TooltipContent>
        </Tooltip>
        <div>
          <SearchInput />
        </div>
      </div>

      {/* Right Side */}
      <div className="mx-4 flex gap-x-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="link"
              className="text-muted-foreground hover:no-underline"
            >
              Personal
              <ChevronDown size={20} className="ml-1" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <ThemeToggle />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="bg-primary/70 hover:bg-primary/90"
              >
                <Plus size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick Create</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-row">
          <Button variant={"ghost"} size={"icon"}>
            <Users size={16} />
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <Bell size={16} />
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <Settings size={16} />
          </Button>
        </div>
        <Avatar className="mx-2">
          <AvatarImage />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Button variant={"ghost"} size={"icon"}>
          <LayoutGrid size={20} />
        </Button>
      </div>
    </div>
  );
};

export default HeaderComponents;
