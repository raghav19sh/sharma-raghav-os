import type { Metadata } from "next";
import { Mail, GitBranch, MapPin, Info } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { SKILL_AREAS } from "@/lib/data/skills";

export const metadata: Metadata = { title: "About OS", description: "Bio, skills, and how to get in touch." };
export const revalidate = 300;

export default async function AboutPage() {
  const supabase = createServerSupabaseClient();
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

      <div className="grid grid-cols-2 gap-4 max-[1024px]:grid-cols-1">
        <Card>
          <div className="w-14 h-14 rounded-full bg-lavender text-on-lavender font-semibold text-lg flex items-center justify-center mb-2.5">RS</div>
          <h2 className="text-[19px] font-semibold text-text-1">{profile?.display_name ?? "Raghav Sharma"}</h2>
          <p className="text-[13px] text-text-2 mb-3">{profile?.headline ?? "Cybersecurity student — malware analysis, threat detection, SOC fundamentals"}</p>
          <p className="text-[13.5px] text-text-2 leading-relaxed mb-4">
            {profile?.bio ??
              "Third-year B.Tech Computer Science and Engineering student at MIT ADT University, focused on malware analysis, vulnerability assessment, and security operations. This platform is where that work lives in public."}
          </p>
          <div className="flex flex-col gap-2.5">
            <a href={`mailto:${profile?.email_public ?? "contact@sharma-raghav.com"}`} className="flex items-center gap-2.5 text-[13px] text-text-2 hover:text-lavender">
              <Mail size={15} /> {profile?.email_public ?? "contact@sharma-raghav.com"}
            </a>
            {(profile?.github_url) && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[13px] text-text-2 hover:text-lavender">
                <GitBranch size={15} /> GitHub
              </a>
            )}
            <span className="flex items-center gap-2.5 text-[13px] text-text-2">
              <MapPin size={15} /> {profile?.location ?? "Pune, India"}
            </span>
          </div>
        </Card>

        <Card>
          <div className="text-[13px] font-semibold text-text-1 mb-1">Education</div>
          <p className="text-[13.5px] text-text-2 mb-4">
            B.Tech, Computer Science &amp; Engineering — MIT ADT University (2023–2027, in progress)
          </p>
          <div className="text-[13px] font-semibold text-text-1 mb-1">Experience</div>
          <p className="text-[13.5px] text-text-2">
            Business Analyst Virtual Intern, AICTE-EduSkills (Celonis-supported) — Apr–Jun 2025.
            Grade O (Outstanding).
          </p>
        </Card>
      </div>

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
