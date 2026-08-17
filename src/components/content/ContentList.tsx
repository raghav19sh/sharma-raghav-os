import Link from "next/link";
import { EmptyState } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/format";
import type { LucideIcon } from "lucide-react";

interface GenericItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  kind?: string | null;
  status?: string;
  read_time_minutes?: number | null;
  published_at?: string | null;
  created_at: string;
}

export function ContentList({
  basePath, items, icon: Icon, emptyTitle, emptyText,
}: {
  basePath: string;
  items: GenericItem[];
  icon: LucideIcon;
  emptyTitle: string;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} text={emptyText} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 max-[1024px]:grid-cols-1">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.slug}`}
          className="bg-surface border border-border rounded-card p-[18px] flex flex-col gap-2 hover:border-lavender transition-colors"
        >
          <div className="flex items-center gap-2">
            {item.kind && (
              <span className="text-[10.5px] font-semibold text-text-2 bg-bg border border-border px-2 py-0.5 rounded-md">
                {item.kind}
              </span>
            )}
          </div>
          <div className="text-[15px] font-semibold text-text-1 leading-snug">{item.title}</div>
          {item.summary && <p className="text-[13px] text-text-2 leading-relaxed">{item.summary}</p>}
          <div className="flex gap-3 text-[11.5px] text-text-2 mt-1">
            <span>{formatDate(item.published_at ?? item.created_at)}</span>
            {item.read_time_minutes && <span>{item.read_time_minutes} min read</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}
