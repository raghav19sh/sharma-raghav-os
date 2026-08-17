import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-text-2">404</div>
      <h1 className="text-[22px] font-semibold text-text-1">This page doesn&apos;t exist</h1>
      <p className="text-[13.5px] text-text-2 max-w-sm">
        Nothing lives at this address — either the link is wrong, or the record it pointed to was
        unpublished or removed.
      </p>
      <Link href="/" className="mt-2 bg-lavender text-on-lavender text-[14px] font-medium px-5 py-2.5 rounded-btn">
        Back to Command Center
      </Link>
    </div>
  );
}
