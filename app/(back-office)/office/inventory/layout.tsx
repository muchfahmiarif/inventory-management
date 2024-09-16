import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import React from "react";

interface LayoutInventoryPageProps {
  children: React.ReactNode;
}

const LayoutInventoryPage: React.FC<LayoutInventoryPageProps> = ({
  children,
}) => {
  return (
    <div>
      <div className="absolute right-0 top-[4.3rem] flex items-center justify-center">
        <Button
          variant={"default"}
          size={"sm"}
          className="rounded-l-md rounded-r-none"
        >
          <MessageCircleQuestion className="h-5 w-5" />
        </Button>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default LayoutInventoryPage;
