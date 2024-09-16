"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "./switch";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center">
      <Switch
        defaultChecked={resolvedTheme === "dark"}
        onCheckedChange={() => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};

export default ThemeToggle;
