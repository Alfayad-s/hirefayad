"use client";

import { ChevronDown } from "lucide-react";

type Props = { href: string; label: string };

export function ScrollToSection({ href, label }: Props) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="mt-12 flex flex-col items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      aria-label={label}
    >
      <span>{label}</span>
      <ChevronDown className="size-5 animate-bounce" />
    </a>
  );
}
