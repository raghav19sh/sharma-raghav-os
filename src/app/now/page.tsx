import type { Metadata } from "next";
import { Compass, BookOpen, Wrench, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Now", description: "What Raghav is building, learning, and researching now." };

const sections = [
  { icon: Wrench, title: "Building", items: ["Sharma-Raghav OS", "Security labs and practical tooling"] },
  { icon: Target, title: "Current focus", items: ["Web security", "Cloud security", "Security engineering"] },
  { icon: BookOpen, title: "Learning", items: ["Cybersecurity foundations", "Spanish", "Systems and software engineering"] },
  { icon: Compass, title: "Researching", items: ["Web application security", "Threat detection and malware analysis"] },
];

export default function NowPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-2">Now</div>
        <h1 className="text-[30px] font-semibold tracking-tight text-text-1">What I&apos;m working on</h1>
        <p className="text-[14px] text-text-2 mt-2">A snapshot of the current direction of the platform and its owner.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
        {sections.map(({ icon: Icon, title, items }) => (
          <Card key={title}>
            <div className="flex items-center gap-2.5 mb-4"><Icon size={17} className="text-burgundy-accent" /><span className="font-semibold text-text-1">{title}</span></div>
            <ul className="flex flex-col gap-2 text-[13.5px] text-text-2">{items.map((item) => <li key={item}>• {item}</li>)}</ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
