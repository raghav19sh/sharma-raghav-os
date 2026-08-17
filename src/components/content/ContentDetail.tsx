import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

interface GenericItem {
  title: string;
  summary: string | null;
  body: string | null;
  kind?: string | null;
  status?: string;
  read_time_minutes?: number | null;
  published_at?: string | null;
  created_at: string;
  stack?: string[];
  repo_url?: string | null;
  live_url?: string | null;
}

interface Tag { name: string; slug: string }
interface RelatedItem { table: string; id: string; title: string; href: string }

export function ContentDetail({
  item, tags = [], related = [],
}: {
  item: GenericItem;
  tags?: Tag[];
  related?: RelatedItem[];
}) {
  return (
    <article className="max-w-2xl">
      <div className="flex items-center gap-2 mb-3">
        {item.kind && (
          <span className="text-[10.5px] font-semibold text-text-2 bg-bg border border-border px-2 py-0.5 rounded-md">
            {item.kind}
          </span>
        )}
      </div>
      <h1 className="text-[26px] font-semibold text-text-1 leading-tight mb-2">{item.title}</h1>
      <div className="flex gap-3 text-[12.5px] text-text-2 mb-6">
        <span>{formatDate(item.published_at ?? item.created_at)}</span>
        {item.read_time_minutes && <span>{item.read_time_minutes} min read</span>}
      </div>

      {item.summary && <p className="text-[15px] text-text-2 leading-relaxed mb-6">{item.summary}</p>}

      {item.stack && item.stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {item.stack.map((s) => (
            <span key={s} className="text-[11.5px] text-text-2 bg-bg border border-border px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      )}

      {(item.repo_url || item.live_url) && (
        <div className="flex gap-3 mb-6">
          {item.repo_url && <a href={item.repo_url} target="_blank" rel="noreferrer" className="text-[13px] text-lavender underline">Repository</a>}
          {item.live_url && <a href={item.live_url} target="_blank" rel="noreferrer" className="text-[13px] text-lavender underline">Live</a>}
        </div>
      )}

      {item.body ? (
        <div className="text-[14.5px] text-text-1 leading-[1.75] whitespace-pre-wrap">{item.body}</div>
      ) : (
        <p className="text-[13.5px] text-text-2 italic">Full write-up not published yet.</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
          {tags.map((t) => (
            <span key={t.slug} className="text-[11.5px] text-lavender-text bg-lavender-tint px-2.5 py-1 rounded-full">#{t.name}</span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-2">Related</div>
          <div className="flex flex-col gap-1.5">
            {related.map((r) => (
              <Link key={`${r.table}-${r.id}`} href={r.href} className="text-[13px] text-lavender hover:underline">{r.title}</Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
