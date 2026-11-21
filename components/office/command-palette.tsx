"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchResult {
  group: string;
  label: string;
  extra: string | null;
  href: string;
}

// Global search palette — opens on "/" (outside inputs) or Ctrl+K
export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openEvent = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", openEvent);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", openEvent);
    };
  }, []);



  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const groups = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQuery("");
          setResults([]);
        }
      }}
    >
      <CommandInput
        placeholder="Search items, contacts, transactions…"
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          if (v.trim().length < 1) setResults([]);
        }}
      />
      <CommandList>
        {!loading && results.length === 0 && query.length > 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No matches found
          </p>
        )}
        {query.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Type to search across your records
          </p>
        )}
        {Object.entries(groups).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((r) => (
              <CommandItem key={r.href} onSelect={() => go(r.href)}>
                <span className="font-medium">{r.label}</span>
                {r.extra && (
                  <span className="ml-2 text-xs text-muted-foreground">{r.extra}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {loading && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Searching…</p>
        )}
      </CommandList>
    </CommandDialog>
  );
}
