import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { getPublicTimeline } from "@/lib/data/timeline";
import { getStatusSnapshot } from "@/lib/data/status";
import { getRecentActivity } from "@/lib/activity";
import { HeroGlobe } from "@/components/globe/HeroGlobe";
import { Card, EmptyState, StatusPill } from "@/components/ui/Card";
import { Terminal } from "@/components/terminal/Terminal";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { formatDate } from "@/lib/utils/format";
import type { Project, Research } from "@/types/database";

export const revalidate = 60; // real content changes rarely; no need to hit the DB on every request

export default async function CommandCenterPage() {
  const supabase = await createServerSupabaseClient();

  const [research, projects, timeline, status, activity] = await Promise.all([
    getPublishedContent<Research>(supabase, "research", { pageSize: 4 }),
    getPublishedContent<Project>(supabase, "projects", { pageSize: 4 }),
    getPublicTimeline(supabase),
    getStatusSnapshot(supabase),
    getRecentActivity(supabase, 6),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[2.1fr_1fr] gap-5 items-start max-[1400px]:grid-cols-1">
        <section className="relative bg-surface border border-border rounded-card p-9 flex items-center gap-6 min-h-[420px] max-[640px]:flex-col max-[640px]:p-6">
          <div className="flex-1 max-w-[420px]">
            <div className="text-[12px] font-semibold tracking-wide uppercase text-text-2 mb-3.5">Command Center</div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight mb-3.5 text-text-1">
              Personal cybersecurity &amp; knowledge platform.
            </h1>
            <p className="text-[15px] text-text-2 leading-relaxed mb-6">
              A real, database-backed record of research, engineering, and security work in progress.
              What you see below is queried live — nothing on this page is simulated.
            </p>
            <div className="flex gap-3">
              <Link href="/research" className="inline-flex items-center gap-2 bg-lavender text-on-lavender text-[14px] font-medium px-5 py-2.5 rounded-btn">
                Explore Research OS <ArrowRight size={15} />
              </Link>
              <Link href="/ai-terminal" className="inline-flex items-center border border-border-strong text-text-1 text-[14px] font-medium px-5 py-2.5 rounded-btn">
                Open Terminal
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <HeroGlobe />
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-text-1">System Status</span>
              <StatusPill tone={status.database === "ok" ? "green" : "red"}>
                {status.database === "ok" ? "Operational" : "Database error"}
              </StatusPill>
            </div>
            <dl className="flex flex-col gap-2.5 text-[13px]">
              <Row label="Published research" value={status.contentCounts.research} />
              <Row label="Public projects" value={status.contentCounts.projects} />
              <Row label="Published articles" value={status.contentCounts.articles} />
              <Row label="Public journal entries" value={status.contentCounts.journalPublic} />
              <Row label="Checked" value={new Date(status.timestamp).toLocaleTimeString()} />
            </dl>
            <p className="text-[11px] text-text-2 mt-3 pt-3 border-t border-border">
              No CPU/memory/traffic numbers are shown here — this deployment has no real telemetry
              source connected yet (see PLAN.md §25). This card only shows what the database can
              actually confirm.
            </p>
          </Card>

          <Card>
            <div className="text-[13px] font-semibold text-text-1 mb-3">Terminal</div>
            <Terminal compact />
          </Card>
        </div>
      </div>

      <div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-text-2 mb-3">Recent research</div>
        {research.data.length === 0 ? (
          <EmptyState title="Research archive is empty" text="Begin by publishing your first paper in Admin OS." />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 max-[1024px]:grid-cols-1">
            {research.data.map((r) => (
              <Link key={r.id} href={`/research/${r.slug}`} className="bg-surface border border-border rounded-card p-4 hover:border-lavender transition-colors">
                <div className="text-[14px] font-semibold text-text-1 mb-1">{r.title}</div>
                <div className="text-[12px] text-text-2">{formatDate(r.published_at ?? r.created_at)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 max-[1024px]:grid-cols-1">
        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-3">Active projects</div>
          {projects.data.length === 0 ? (
            <EmptyState title="No public projects yet" text="Projects appear here once published and marked public in Admin OS." />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {projects.data.map((p) => (
                <li key={p.id}>
                  <Link href={`/engineering/${p.slug}`} className="flex items-center justify-between text-[13.5px] text-text-1 hover:text-lavender">
                    <span>{p.title}</span>
                    <StatusPill tone={p.status === "active" ? "green" : "neutral"}>{p.status}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-3">Recent activity</div>
          <ActivityFeed events={activity} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-semibold text-text-1">Timeline</span>
          <Link href="/timeline" className="text-[12px] text-text-2 hover:text-lavender">View full →</Link>
        </div>
        {timeline.length === 0 ? (
          <EmptyState title="Timeline is empty" text="Add milestones in Admin OS to populate this." />
        ) : (
          <ol className="flex flex-wrap gap-4">
            {timeline.slice(-5).map((t) => (
              <li key={t.id} className={`text-[12px] ${t.is_current ? "text-lavender font-semibold" : "text-text-2"}`}>
                {t.year_label} — {t.title}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-2">{label}</dt>
      <dd className="font-mono font-semibold text-text-1">{value}</dd>
    </div>
  );
}
