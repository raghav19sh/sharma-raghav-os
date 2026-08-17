import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Documentation", description: "Architecture and usage notes for Sharma-Raghav OS." };

const docs = [
  ["What is Sharma-Raghav OS?", "A personal operating system connecting research, knowledge, engineering, security work, learning, and public proof of work."],
  ["Architecture", "Next.js App Router provides the UI and server routes; Supabase provides authentication and database-backed content; middleware and server-side checks protect admin surfaces."],
  ["Public vs private", "Visitors can read explicitly public content. Admin mutations require authentication and a server-side allow-list check."],
  ["Security", "Input validation, RLS, defense-in-depth authorization, audit logging, security headers, and conservative error handling are part of the platform design."],
  ["Keyboard", "⌘/Ctrl+K opens universal search. Escape closes it; arrow keys move through results; Enter opens the selected result."],
];

export default function DocsPage() { return <div className="flex flex-col gap-6 max-w-3xl"><div><div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-2">Documentation</div><h1 className="text-[30px] font-semibold text-text-1">How the system works</h1></div>{docs.map(([title, body]) => <Card key={title}><h2 className="text-[15px] font-semibold text-text-1">{title}</h2><p className="text-[13.5px] leading-relaxed text-text-2 mt-2">{body}</p></Card>)}</div>; }
