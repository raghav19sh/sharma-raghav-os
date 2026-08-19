"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, FlaskConical, Network } from "lucide-react";
import type { Research } from "@/types/database";

function splitBody(body: string | null) {
  if (!body) return [];
  return body.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 4);
}

export function ResearchOS({ items }: { items: Research[] }) {
  const [selected, setSelected] = useState<string | null>(items[0]?.id ?? null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selected) ?? null,
    [items, selected]
  );

  if (!items.length) {
    return (
      <div className="researchos-empty">
        <FlaskConical size={22} />
        <div><strong>Research archive is empty.</strong><p>Publish your first paper in Admin OS to grow the graph.</p></div>
      </div>
    );
  }

  return (
    <div className="researchos">
      <div className="researchos__hero">
        <div>
          <span className="researchos__eyebrow">KNOWLEDGE GRAPH / 2026</span>
          <h1>Research OS</h1>
          <p>Research is treated as a living system: questions branch into methods, results and future work.</p>
        </div>
        <Network size={25} />
      </div>

      <div className="researchos__workspace">
        <aside className="researchos__tree" aria-label="Research tree">
          <div className="researchos__root">2026</div>
          <div className="researchos__branch">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`researchos__node ${selected === item.id ? "is-selected" : ""}`}
                onClick={() => setSelected(item.id)}
              >
                <ChevronRight size={14} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
          <div className="researchos__future">
            <span>└── FUTURE RESEARCH</span>
            <small>New questions emerge from finished work.</small>
          </div>
        </aside>

        <section className="researchos__detail">
          {selectedItem && (
            <>
              <div className="researchos__detail-head">
                <div>
                  <span>{selectedItem.kind} · {selectedItem.status.toUpperCase()}</span>
                  <h2>{selectedItem.title}</h2>
                </div>
                <span className="researchos__pulse" />
              </div>

              {selectedItem.summary && <p className="researchos__summary">{selectedItem.summary}</p>}

              <div className="researchos__sections">
                <div><span>01 / PROBLEM</span><p>{splitBody(selectedItem.body)[0] ?? "Problem statement is recorded in the research write-up."}</p></div>
                <div><span>02 / HYPOTHESIS</span><p>{splitBody(selectedItem.body)[1] ?? "Hypothesis and research question are part of the documented methodology."}</p></div>
                <div><span>03 / METHODOLOGY</span><p>{splitBody(selectedItem.body)[2] ?? "Methods, experiments and evidence are documented in the full paper."}</p></div>
                <div><span>04 / RESULTS</span><p>{splitBody(selectedItem.body)[3] ?? "Results are presented in the published research record."}</p></div>
              </div>

              <Link href={`/research/${selectedItem.slug}`} className="researchos__open">
                OPEN RESEARCH RECORD <ArrowRight size={15} />
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
