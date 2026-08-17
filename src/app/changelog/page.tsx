import type { Metadata } from "next";
import { GitCommitHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Changelog", description: "A public record of meaningful Sharma-Raghav OS changes." };

const releases = [
  { date: "17 Aug 2026", version: "2.1", items: ["Reorganized navigation into Command, Knowledge, Build, Security, Personal, and System.", "Added Now, Changelog, and Documentation surfaces.", "Hardened API error responses and request tracing."] },
  { date: "13 Aug 2026", version: "2.0", items: ["Sharma-Raghav OS went live as a database-backed public platform.", "Added public research, projects, activity, timeline, and security tooling."] },
];

export default function ChangelogPage() {
  return <div className="flex flex-col gap-6 max-w-3xl"><div><div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-2">Changelog</div><h1 className="text-[30px] font-semibold text-text-1">How the OS evolves</h1></div>{releases.map((r) => <Card key={r.version}><div className="flex items-center gap-2 text-text-1 font-semibold"><GitCommitHorizontal size={17} className="text-burgundy-accent" /> v{r.version} · {r.date}</div><ul className="mt-4 flex flex-col gap-2 text-[13.5px] text-text-2">{r.items.map((item) => <li key={item}>• {item}</li>)}</ul></Card>)}</div>;
}
