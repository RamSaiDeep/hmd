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
        disabled
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;

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

