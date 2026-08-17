"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <h1 className="text-[20px] font-semibold text-text-1">
        Something went wrong
      </h1>

      <p className="text-[13.5px] text-text-2 max-w-sm">
        This page failed to load. It has been logged. You can try again, or
        head back to Command Center.
      </p>

      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="bg-lavender text-on-lavender text-[14px] font-medium px-5 py-2.5 rounded-btn"
        >
          Try again
        </button>

        <Link
          href="/"
          className="border border-border-strong text-text-1 text-[14px] font-medium px-5 py-2.5 rounded-btn"
        >
          Command Center
        </Link>
      </div>
    </div>
  );
}