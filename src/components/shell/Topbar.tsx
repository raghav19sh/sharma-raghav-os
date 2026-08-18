"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";

export function Topbar({
  mobileNavOpen,
  onToggleMobileNav,
  onOpenSearch,
}: {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
  onOpenSearch: () => void;
}) {

  return (
    <header className="sticky top-0 z-[100] flex items-center gap-5 h-[68px] px-6 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="hidden max-[980px]:flex w-9 h-9 rounded-btn border border-border bg-surface items-center justify-center"
          onClick={onToggleMobileNav}
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <Link href="/" className="w-9 h-9 rounded-[10px] bg-burgundy flex items-center justify-center text-on-lavender font-bold text-sm shrink-0">
          SR
        </Link>
        <div className="leading-tight">
          <div className="font-semibold text-[15px] text-text-1">Sharma-Raghav OS</div>
          <div className="text-[11px] text-text-2 max-[980px]:hidden">Personal Cybersecurity &amp; Knowledge Platform</div>
        </div>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex-1 max-w-[440px] mx-auto flex items-center gap-2.5 bg-surface border border-border rounded-btn px-3.5 py-2 text-text-2 max-[980px]:max-w-[220px] max-[640px]:max-w-[42px] max-[640px]:px-0 max-[640px]:justify-center"
      >
        <Search size={15} />
        <span className="flex-1 text-left text-sm text-text-2 max-[640px]:hidden">Search anything…</span>
        <span className="text-[11px] font-mono border border-border rounded px-1.5 py-0.5 bg-bg max-[640px]:hidden">⌘K</span>
      </button>

      <div className="flex items-center gap-3.5 shrink-0 ml-auto">
        <Link href="/about" className="w-[34px] h-[34px] rounded-full bg-lavender text-on-lavender flex items-center justify-center font-semibold text-[12.5px]" aria-label="About Raghav">
          RS
        </Link>
      </div>
    </header>
  );
}
