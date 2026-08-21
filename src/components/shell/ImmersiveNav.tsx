"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/pages";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/engineering", label: "Work" },
  { href: "/research", label: "Research" },
  { href: "/security-lab", label: "Lab" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export function ImmersiveNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const directory = PAGES.filter((item) => item.group !== "bottom" && item.href !== "/");

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  if (pathname.startsWith("/adminrs")) return null;

  function openSearch() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        metaKey: true,
        bubbles: true,
      })
    );
  }

  return (
    <header className="immersive-nav">
      <Link href="/" className="immersive-nav__brand" aria-label="Raghav Sharma home">
        <span>R</span><i>/</i><span>S</span>
      </Link>

      <nav className="immersive-nav__links" aria-label="Primary navigation">
        {PRIMARY.slice(1).map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>

      <div className="immersive-nav__actions">
        <button type="button" onClick={openSearch} aria-label="Open search" title="Search">
          <Search size={16} strokeWidth={1.5} />
        </button>
        <Link href="/about" className="immersive-nav__index">01 / 06</Link>
        <button
          type="button"
          className="immersive-nav__menu"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className="immersive-nav__mobile-panel">
          {PRIMARY.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <ArrowUpRight size={18} strokeWidth={1.4} />
            </Link>
          ))}
          <div className="immersive-nav__directory-label">Full index</div>
          {directory.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span>{String(index + 7).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <ArrowUpRight size={18} strokeWidth={1.4} />
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
