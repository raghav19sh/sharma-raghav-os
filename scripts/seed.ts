/* eslint-disable no-console */
/**
 * Seeds the database with ONLY what the audit (PLAN.md, Phase 1 / §45)
 * verified against the resume. Deliberately does NOT seed the prototype's
 * invented research papers, extra projects, articles, journal entries,
 * books, courses, or SOC alerts — see PLAN.md §8 for the full list of what
 * was left out and why.
 *
 * Usage: npm run seed
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.
 */
import { createServiceRoleClient } from "../src/lib/supabase/server-admin";

async function main() {
  const supabase = createServiceRoleClient();

  console.log("Seeding profile…");
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: process.env.SEED_ADMIN_USER_ID ?? "00000000-0000-0000-0000-000000000000",
      display_name: "Raghav Sharma",
      headline: "Cybersecurity student — malware analysis, threat detection, SOC fundamentals",
      bio: "B.Tech Computer Science and Engineer (MIT ADT University), focused on malware analysis, vulnerability assessment, and security operations.",
      location: "Pune, India",
      email_public: "contact@sharma-raghav.com",
      github_url: null, // resume references "Raghav Sharma - Git" without a resolvable URL — fill in once confirmed, don't guess
      linkedin_url: "https://linkedin.com/in/sharmaraghav1",
      domain: "sharma-raghav.com",
    },
    { onConflict: "id" }
  );
  if (profileError) console.error("profiles:", profileError.message);

  console.log("Seeding projects (2 real projects from resume)…");
  const { error: projectsError } = await supabase.from("projects").upsert(
    [
      {
        slug: "qr-phishing-quishing-simulation",
        title: "QR Phishing (Quishing) Simulation",
        kind: "Cybersecurity Project",
        summary: "A proof-of-concept phishing simulation demonstrating credential harvesting via malicious QR codes.",
        body: "Engineered a proof-of-concept phishing simulation tool to demonstrate credential harvesting via malicious QR codes. Developed cloned landing pages using Python and Flask to track user interaction and attack vectors. Analyzed email security filter bypass techniques and documented mitigation strategies for phishing threats. Implemented logging and monitoring to simulate real-world social engineering attack scenarios.",
        stack: ["Python", "Flask", "Kali Linux", "Ngrok", "Social Engineering Toolkit (SET)"],
        status: "completed",
        visibility: "public",
        started_at: "2026-01-01",
      },
      {
        slug: "malware-analysis-clipper-research",
        title: "Malware Analysis & Clipper Research Project",
        kind: "Cybersecurity Project",
        summary: "Static and dynamic malware analysis, including a proof-of-concept clipboard-hijacking (\"clipper\") sample built to study the risk class.",
        body: "Conducted static and dynamic malware analysis on sample binaries to identify obfuscation and persistence mechanisms. Developed a proof-of-concept Clipper malware to demonstrate unauthorized clipboard manipulation risks. Analyzed API calls, memory behavior, and C2 communication patterns using reverse engineering tools. Utilized Ghidra, x64dbg, and ProcMon for behavioral and forensic analysis of malicious samples.",
        stack: ["Python", "C++", "Ghidra", "x64dbg", "ProcMon", "Kali Linux"],
        status: "completed",
        visibility: "public",
        started_at: "2026-02-01",
      },
    ],
    { onConflict: "slug" }
  );
  if (projectsError) console.error("projects:", projectsError.message);

  console.log("Seeding courses (2 real certifications from resume)…");
  const { error: coursesError } = await supabase.from("courses").upsert(
    [
      { title: "Digital Forensics", provider: null, status: "completed", progress_percent: 100, is_certification: true, visibility: "public" },
      { title: "Cloud Foundations (AWS)", provider: "AWS", status: "completed", progress_percent: 100, is_certification: true, visibility: "public" },
    ],
    { onConflict: "title" }
  );
  if (coursesError) console.error("courses:", coursesError.message);

  console.log("Seeding timeline (education + the one real internship)…");
  const { error: timelineError } = await supabase.from("timeline_events").upsert(
    [
      { year_label: "2021", title: "Completed 10th grade", body: "Delhi Public School, Hisar, Haryana.", sort_order: 1, visibility: "public" },
      { year_label: "2023", title: "Completed 12th grade; started B.Tech", body: "Delhi Public School, Hisar. Began B.Tech in Computer Science and Engineering at MIT ADT University.", sort_order: 2, visibility: "public" },
      { year_label: "2025", title: "Business Analyst Virtual Internship", body: "AICTE-EduSkills (Celonis-supported), Apr–Jun 2025. Data analysis and process mining. Graded O (Outstanding).", event_date: "2025-04-01", sort_order: 3, visibility: "public" },
      { year_label: "2026", title: "QR Phishing Simulation project", body: "Built a credential-harvesting simulation to study QR-code phishing and email filter bypass.", event_date: "2026-01-01", sort_order: 4, visibility: "public" },
      { year_label: "2026", title: "Malware Analysis & Clipper Research", body: "Static/dynamic malware analysis and a proof-of-concept clipper sample for research purposes.", event_date: "2026-02-01", sort_order: 5, visibility: "public" },
      { year_label: "2026", title: "Sharma-Raghav OS goes live", body: "Shipped this platform as a real, database-backed home for research, engineering, and security work.", event_date: "2026-08-13", is_current: true, sort_order: 6, visibility: "public" },
      { year_label: "2027", title: "Expected graduation", body: "B.Tech, Computer Science and Engineering, MIT ADT University.", sort_order: 7, visibility: "public" },
    ],
    { onConflict: "title" }
  );
  if (timelineError) console.error("timeline_events:", timelineError.message);

  console.log("Done. Research, articles, journal, books, media, and SOC alerts were");
  console.log("intentionally left empty — see PLAN.md §8 for why.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
