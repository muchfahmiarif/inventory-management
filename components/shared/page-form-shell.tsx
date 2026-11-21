"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";

interface PageFormShellProps {
  title: string;
  children: React.ReactNode;
  // Footer actions; defaults to Cancel + Save (type="submit" hits the form below)
  footer?: React.ReactNode;
  formId?: string;
}

// Full-page New/Edit form shell (Zoho pattern): h2 title + X close on top,
// content in the middle, sticky Save/Cancel footer at the bottom.
const PageFormShell = ({
  title,
  children,
  footer,
  formId = "page-form",
}: PageFormShellProps) => {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between px-8 py-4">
        <h2 className="text-3xl">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={() => router.back()}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 px-8">{children}</div>
      <div className="sticky bottom-0 border-t bg-background px-8 py-3">
        {footer ?? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const el = document.getElementById(formId);
                if (el instanceof HTMLFormElement) el.requestSubmit();
              }}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageFormShell;
