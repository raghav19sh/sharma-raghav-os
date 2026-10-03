"use client";

import { RainAudio } from "@/components/terminal/RainAudio";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SearchModal } from "@/components/search/SearchModal";
import { MusicPlayer } from "./MusicPlayer";
import { Minesweeper } from "./Minesweeper";
import { ImmersiveNav } from "./ImmersiveNav";
export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /*
   * Global keyboard shortcut:
   * Cmd + K on macOS
   * Ctrl + K on Windows/Linux
   */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (pathname === "/") return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <ImmersiveNav />

      {/* TOPBAR */}
      <Topbar
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() =>
          setMobileNavOpen((open) => !open)
        }
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* MOBILE NAVIGATION OVERLAY */}
      {mobileNavOpen && (
        <div
          className="
            hidden
            max-[980px]:block
            fixed
            inset-0
            top-[68px]
            bg-black/40
            z-[90]
          "
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN SHELL */}
      <div className="flex items-start">
        {/* SIDEBAR */}
        <Sidebar
          open={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
        />

        {/* PAGE CONTENT */}
        <main
          id="main-content"
          className="
            flex-1
            min-w-0
            px-8
            py-6
            pb-12
            max-[640px]:px-4
          "
        >
          {children}
        </main>
      </div>

      {/* GLOBAL SEARCH */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* FLOATING MUSIC PLAYER */}
      <MusicPlayer />
      <Minesweeper />
      <RainAudio />
    </div>
  );
}