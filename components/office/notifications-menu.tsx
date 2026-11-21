"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationRow {
  id: string;
  action: string;
  entityLabel: string | null;
  createdAt: string;
}

// Header bell: shows the latest activity_log entries, refreshed on open
export function NotificationsMenu() {
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<NotificationRow[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setRows(data.notifications ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) void load();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"} aria-label="Notifications">
          <Bell size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-2 text-sm font-medium">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : rows && rows.length ? (
            rows.map((n) => (
              <div
                key={n.id}
                className="border-b px-4 py-2 text-sm last:border-b-0"
              >
                <p className="capitalize">{n.action}</p>
                {n.entityLabel && (
                  <p className="text-xs text-muted-foreground">{n.entityLabel}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          )}
        </div>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/office/home/recent-updates">View all activity</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
