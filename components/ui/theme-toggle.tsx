"use client";

import React from "react";
import { Switch } from "./switch";
import { useTheme } from "next-themes";

const noopSubscribe = () => () => {};

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  // Detect client mount without setState-in-effect (react-hooks/set-state-in-effect)
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

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
