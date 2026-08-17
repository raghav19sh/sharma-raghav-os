import { ExternalLink } from "lucide-react";
import { relativeTime } from "@/lib/utils/format";

const TAG_STYLE: Record<string, string> = {
  research: "bg-lavender-tint text-lavender-text",
  project: "bg-blue-tint text-blue-text",
  article: "bg-lavender-tint text-lavender-text",
  journal: "bg-red-tint text-burgundy-accent",
};

function tagFor(kind: string) {
  if (kind.startsWith("research")) return { label: "RESEARCH", cls: TAG_STYLE.research };
  if (kind.startsWith("project")) return { label: "PROJECT", cls: TAG_STYLE.project };
  if (kind.startsWith("article")) return { label: "ARTICLE", cls: TAG_STYLE.article };
  if (kind.startsWith("journal")) return { label: "JOURNAL", cls: TAG_STYLE.journal };
  return { label: kind.toUpperCase(), cls: "bg-bg text-text-2" };
}

interface ActivityEventLite { id: string; kind: string; summary: string; occurred_at: string }

export function ActivityFeed({ events }: { events: ActivityEventLite[] }) {
  if (events.length === 0) {
    return <p className="text-[13px] text-text-2">Nothing published yet — this fills in as real content goes live.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {events.map((e) => {
        const tag = tagFor(e.kind);
        return (
          <div key={e.id} className="flex items-start gap-2.5 py-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lavender mt-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-text-2 mb-0.5">{relativeTime(e.occurred_at)}</div>
              <div className="text-[12.5px] text-text-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mr-1.5 ${tag.cls}`}>{tag.label}</span>
                {e.summary}
              </div>
            </div>
            <ExternalLink size={13} className="text-text-2 mt-1 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
