"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Toggle theme"
        title="Toggle theme"
        className="opacity-50"
      >
        <div className="w-4 h-4 animate-pulse" />
      </Button>
    );
  }

  const current = theme === "system" ? resolvedTheme ?? "light" : theme ?? "light";

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {current === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

