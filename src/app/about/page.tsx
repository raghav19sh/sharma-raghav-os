import type { Metadata } from "next";
import { Mail, MapPin, Info } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SKILL_AREAS } from "@/lib/data/skills";

export const metadata: Metadata = { title: "About OS", description: "Bio, skills, and how to get in touch." };
export const revalidate = 300;

export default async function AboutPage() {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Info size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">About OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Bio, skills, and how to get in touch.</p>
        </div>
      </div>

      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-3">Profile</div>
        <div className="grid grid-cols-4 gap-4 max-[800px]:grid-cols-2">
          <div><div className="text-[12px] text-text-2">Currently</div><div className="text-[13.5px] font-semibold text-text-1 mt-1">Cybersecurity &amp; Forensics</div></div>
          <div><div className="text-[12px] text-text-2">Focus</div><div className="text-[13.5px] font-semibold text-text-1 mt-1">VAPT &amp; Ethical Hacking</div></div>
          <div><div className="text-[12px] text-text-2">Building</div><div className="text-[13.5px] font-semibold text-text-1 mt-1">Sharma-Raghav OS</div></div>
          <div><div className="text-[12px] text-text-2">Approach</div><div className="text-[13.5px] font-semibold text-text-1 mt-1">Learn by building</div></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 max-[1024px]:grid-cols-1">
        <Card>
          <div className="w-14 h-14 rounded-full bg-lavender text-on-lavender font-semibold text-lg flex items-center justify-center mb-2.5">RS</div>
          <h2 className="text-[19px] font-semibold text-text-1">{profile?.display_name ?? "Raghav Sharma"}</h2>
          <p className="text-[13px] text-text-2 mb-3">{profile?.headline ?? "Cybersecurity student — penetration testing, threat detection, SOC fundamentals"}</p>
          <p className="text-[13.5px] text-text-2 leading-relaxed mb-4">
            {profile?.bio ??
              "B.Tech Computer Science and Engineering (MIT ADT University), focused on malware analysis, vulnerability assessment, and security operations. This platform is where that work lives in public."}
          </p>
          <div className="flex flex-col gap-2.5">
            <a href={`mailto:${profile?.email_public ?? "contact@sharma-raghav.com"}`} className="flex items-center gap-2.5 text-[13px] text-text-2 hover:text-lavender">
              <Mail size={15} /> {profile?.email_public ?? "contact@sharma-raghav.com"}
            </a>
          
            <span className="flex items-center gap-2.5 text-[13px] text-text-2">
              <MapPin size={15} /> {profile?.location ?? "Pune, India"}
            </span>
            <div className="flex items-center gap-2.5 pt-1">
  <a
    href="https://github.com/raghav19sh"
    target="_blank"
    rel="noreferrer"
    aria-label="GitHub"
    title="GitHub"
    className="w-9 h-9 rounded-[10px] border border-border bg-bg flex items-center justify-center text-text-2 hover:text-text-1 hover:border-lavender transition-colors"
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.87-1.35-3.87-1.35-.53-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.04.77 2.1v3.11c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
    </svg>
  </a>

  <a
    href="https://www.linkedin.com/in/sharmaraghav1/"
    target="_blank"
    rel="noreferrer"
    aria-label="LinkedIn"
    title="LinkedIn"
    className="w-9 h-9 rounded-[10px] border border-border bg-bg flex items-center justify-center text-text-2 hover:text-text-1 hover:border-lavender transition-colors"
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.68H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V8.99H3.56v11.46Z"/>
    </svg>
  </a>

  <a
    href="https://wa.me/shrma.raghav"
    target="_blank"
    rel="noreferrer"
    aria-label="WhatsApp"
    title="WhatsApp"
    className="w-9 h-9 rounded-[10px] border border-border bg-bg flex items-center justify-center text-text-2 hover:text-text-1 hover:border-lavender transition-colors"
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.05 0C5.52 0 .2 5.32.2 11.85c0 2.09.55 4.13 1.59 5.92L.1 24l6.38-1.67a11.83 11.83 0 0 0 5.57 1.41h.01c6.53 0 11.85-5.32 11.85-11.85 0-3.17-1.24-6.14-3.39-8.41ZM12.06 21.76h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 0 1-1.51-5.25C2.15 6.42 6.58 2 12.05 2a9.81 9.81 0 0 1 6.98 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.47-4.43 9.87-9.86 9.87Zm5.41-7.39c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>
    </svg>
  </a>

  <a
    href="https://www.instagram.com/raaghav.shrma/"
    target="_blank"
    rel="noreferrer"
    aria-label="Instagram"
    title="Instagram"
    className="w-9 h-9 rounded-[10px] border border-border bg-bg flex items-center justify-center text-text-2 hover:text-text-1 hover:border-lavender transition-colors"
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  </a>
</div>
          </div>
        </Card>

        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-1">Education</div>
          <p className="text-[13.5px] text-text-2 mb-4">
            B.Tech, Computer Science &amp; Engineering (CyberSecurity &amp; Forensics)— MIT ADT University (2023–2027)
          </p>
          <div className="text-[13px] font-semibold text-text-1 mb-1">Experience</div>
          <p className="text-[13.5px] text-text-2">
            Business Analyst Virtual Intern, AICTE-EduSkills (Celonis-supported) — Apr–Jun 2025.
            Grade O (Outstanding).
          </p>
        </Card>
      </div>

      <Card>
        <div className="text-[13px] font-semibold text-text-1 mb-3">Principles</div>
        <div className="grid grid-cols-2 gap-2.5 max-[640px]:grid-cols-1">
          {["Learn by building", "Understand systems", "Document what you learn", "Verify before assuming", "Security before convenience"].map((p) => (
            <div key={p} className="rounded-[10px] bg-bg border border-border px-3 py-2.5 text-[13px] text-text-2">{p}</div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-semibold text-text-1 mb-1">Skills</div>
        <p className="text-[12px] text-text-2 mb-4">
          Shown with evidence rather than a percentage — a claimed number with no methodology
          behind it isn&apos;t more credible than a category list (§29).
        </p>
        <div className="flex flex-col gap-4">
          {SKILL_AREAS.map((area) => (
            <div key={area.name}>
              <div className="text-[13.5px] font-semibold text-text-1 mb-1.5">{area.name}</div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {area.tools.map((t) => (
                  <span key={t} className="text-[11px] text-text-2 bg-bg border border-border px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="text-[12px] text-text-2">Evidence: {area.evidence.join("; ")}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
