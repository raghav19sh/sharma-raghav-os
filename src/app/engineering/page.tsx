import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { CaseFileProjects } from "@/components/projects/CaseFileProjects";
import type { Project } from "@/types/database";

export const metadata: Metadata = {
  title: "Engineering OS",
  description: "Cybersecurity and engineering projects presented as case files.",
};
export const dynamic = "force-dynamic";

export default async function EngineeringPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await getPublishedContent<Project>(supabase, "projects", { pageSize: 50 });
  return <CaseFileProjects projects={data} />;
}
