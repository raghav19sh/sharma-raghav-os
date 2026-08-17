import type { Metadata } from "next";
import { Award } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Learning Hub", description: "Courses, certifications and progress." };
export const revalidate = 60;

export default async function LearningHubPage() {
  const supabase = createServerSupabaseClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("visibility", "public")
    .order("is_certification", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Award size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Learning Hub</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Courses and certifications, sourced from the resume — nothing invented.</p>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <EmptyState title="No courses tracked yet" text="Add courses and certifications in Admin OS." />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 max-[1024px]:grid-cols-1">
          {courses.map((c) => (
            <div key={c.id} className="bg-surface border border-border rounded-card p-[18px] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {c.is_certification && (
                  <span className="text-[10.5px] font-semibold text-lavender-text bg-lavender-tint px-2 py-0.5 rounded-md">Certification</span>
                )}
              </div>
              <div className="text-[15px] font-semibold text-text-1">{c.title}</div>
              {c.provider && <div className="text-[12px] text-text-2">{c.provider}</div>}
              {c.credential_url && (
                <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-[12px] text-lavender underline w-fit">
                  View credential
                </a>
              )}
              <span className="text-[11.5px] text-text-2 capitalize">{c.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
