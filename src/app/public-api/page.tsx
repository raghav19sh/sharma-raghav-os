import type { Metadata } from "next";
import { Server, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Public API", description: "Read-only endpoints. No authentication, no write access." };

// This list must be kept in sync with src/app/api/v1/* by hand for now —
// see PLAN.md's note on this. A future pass could generate it from the
// route tree at build time instead of maintaining it manually twice.
const ENDPOINTS = [
  { method: "GET", path: "/api/v1/research", desc: "List published research (paginated)." },
  { method: "GET", path: "/api/v1/research/:slug", desc: "Fetch a single published research item." },
  { method: "GET", path: "/api/v1/status", desc: "Real content counts + database reachability." },
  { method: "GET", path: "/api/v1/search", desc: "Full-text search across public content." },
];

export default function PublicApiPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Server size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Public API</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Read-only endpoints for developers. No authentication, no write access.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-text-2 bg-lavender-tint rounded-[10px] px-3.5 py-3">
        <Info size={14} />
        Every endpoint below is GET-only and exists in this repo right now — nothing here is
        aspirational documentation for an endpoint that hasn&apos;t been built.
      </div>

      <div className="flex flex-col gap-2">
        {ENDPOINTS.map((e) => (
          <div key={e.path} className="flex items-center gap-3.5 bg-surface border border-border rounded-[10px] px-4 py-3">
            <span className="text-[11px] font-bold text-status-green-text bg-status-green-tint px-2 py-0.5 rounded-md font-mono">{e.method}</span>
            <code className="font-mono text-[13px] text-text-1">{e.path}</code>
            <span className="text-[12.5px] text-text-2 ml-auto">{e.desc}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-card p-5">
        <div className="text-[13px] font-semibold text-text-1 mb-3">Example — GET /api/v1/status</div>
        <pre className="bg-bg border border-border rounded-[10px] px-3.5 py-3 text-[12px] font-mono text-text-1 overflow-x-auto">
{`{
  "data": {
    "database": "ok",
    "timestamp": "2026-08-13T10:00:00.000Z",
    "contentCounts": {
      "research": 0,
      "projects": 2,
      "articles": 0,
      "journalPublic": 0
    }
  }
}`}
        </pre>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-3">Available endpoints</div>
          <div className="font-mono text-[12px] text-text-2 flex flex-col gap-2">
            <span>GET /api/v1/status</span>
            <span>GET /api/v1/research</span>
            <span>GET /api/v1/research/:slug</span>
            <span>GET /api/v1/search?q=...</span>
          </div>
        </Card>
        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-3">Operational notes</div>
          <ul className="text-[12.5px] text-text-2 leading-relaxed flex flex-col gap-2">
            <li>• Public reads return only explicitly public content.</li>
            <li>• Admin mutations require authentication and server-side authorization.</li>
            <li>• Invalid requests return 4xx responses; internal failures return a generic 500 response.</li>
            <li>• AI Terminal is deterministic command routing, not a connected AI agent.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
