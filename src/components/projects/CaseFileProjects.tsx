"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";
import type { Project } from "@/types/database";

function statusLabel(status: Project["status"]) {
  return status.replace("_", " ").toUpperCase();
}

function methodFromProject(project: Project) {
  if (project.body) {
    const lines = project.body.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    return lines.slice(0, 4);
  }
  if (project.stack.length) return project.stack.slice(0, 4).map((s) => `${s} analysis`);
  return ["Discovery", "Architecture", "Implementation", "Validation"];
}

export function CaseFileProjects({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(projects[0]?.id ?? null);

  if (!projects.length) {
    return (
      <div className="casefiles-empty">
        <ShieldCheck size={22} />
        <div>
          <strong>No public case files yet.</strong>
          <p>Publish a project in Admin OS and it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="casefiles">
      <div className="casefiles__intro">
        <div>
          <span className="casefiles__eyebrow">SECURITY ARCHIVE</span>
          <h1>Projects as investigations.</h1>
          <p>Every public build is presented as a case file: threat, objective, method, evidence and outcome.</p>
        </div>
        <span className="casefiles__count">{String(projects.length).padStart(2, "0")} FILES</span>
      </div>

      <div className="casefiles__list">
        {projects.map((project, index) => {
          const expanded = open === project.id;
          const methods = methodFromProject(project);
          return (
            <article key={project.id} className={`casefile ${expanded ? "casefile--open" : ""}`}>
              <button className="casefile__head" type="button" onClick={() => setOpen(expanded ? null : project.id)} aria-expanded={expanded}>
                <div className="casefile__number">CASE FILE #{String(index + 1).padStart(3, "0")}</div>
                <div className="casefile__title">{project.title}</div>
                <div className="casefile__status">{statusLabel(project.status)}</div>
                <ChevronDown className="casefile__chevron" size={18} />
              </button>

              <div className="casefile__body">
                <div className="casefile__grid">
                  <div>
                    <span>THREAT / PROBLEM</span>
                    <p>{project.summary || "Problem statement documented in the project record."}</p>
                  </div>
                  <div>
                    <span>OBJECTIVE</span>
                    <p>{project.kind ? `Build and validate a ${project.kind.toLowerCase()} solution.` : "Design, implement and validate a practical solution."}</p>
                  </div>
                  <div className="casefile__method">
                    <span>METHODOLOGY</span>
                    <ol>
                      {methods.map((method, i) => <li key={`${method}-${i}`}><b>0{i + 1}</b>{method}</li>)}
                    </ol>
                  </div>
                  <div>
                    <span>STATUS</span>
                    <div className="casefile__progress"><i /><i /><i /><i /><i /><i /><i /><i /></div>
                    <p className="casefile__statusline">{statusLabel(project.status)}</p>
                  </div>
                </div>

                {project.body && (
                  <div className="casefile__evidence">
                    <span>EVIDENCE / WRITE-UP</span>
                    <p>{project.body}</p>
                  </div>
                )}

                {project.stack.length > 0 && (
                  <div className="casefile__stack">
                    {project.stack.map((tech) => <span key={tech}>{tech}</span>)}
                  </div>
                )}

                <div className="casefile__actions">
                  <Link href={`/engineering/${project.slug}`} className="casefile__primary">
                    OPEN CASE <ArrowUpRight size={14} />
                  </Link>
                  {project.repo_url && <a href={project.repo_url} target="_blank" rel="noreferrer">GITHUB <ExternalLink size={13} /></a>}
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer">LIVE DEMO <ExternalLink size={13} /></a>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
