import { createServerSupabaseClient } from "@/lib/supabase/server";
import RaghavOSDesktop from "@/components/RaghavOSDesktop";

type Profile = {
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email_public: string | null;
  linkedin_url: string | null;
  github_url: string | null;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  kind: string | null;
  summary: string | null;
  body: string | null;
  repo_url: string | null;
  live_url: string | null;
  stack: string[];
  status: string;
  started_at: string | null;
};

type Research = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  summary: string | null;
  body: string | null;
  status: string;
  read_time_minutes: number | null;
  published_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function PortfolioOSPage() {
  let profile: Profile | null = null;
  let projects: Project[] = [];
  let research: Research[] = [];
  let databaseOnline = false;
  let wallpaperUrl = "/wallpaper.svg";

  try {
    const supabase = await createServerSupabaseClient();

    const [profileResult, projectsResult, researchResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,headline,bio,location,email_public,linkedin_url,github_url")
        .maybeSingle(),
      supabase
        .from("projects")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(0, 49),
      supabase
        .from("research")
        .select("*")
        .eq("visibility", "public")
        .in("status", ["preprint", "published"])
        .order("created_at", { ascending: false })
        .range(0, 49),
    ]);

    profile = (profileResult.data as Profile | null) ?? null;
    projects = (projectsResult.data as Project[] | null) ?? [];
    research = (researchResult.data as Research[] | null) ?? [];
    databaseOnline = !profileResult.error && !projectsResult.error && !researchResult.error;
    try {
      const wallpaperResult = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "wallpaper_url")
        .maybeSingle();
      wallpaperUrl = wallpaperResult.data?.value || "/wallpaper.svg";
    } catch {}
  } catch {
    databaseOnline = false;
  }

  return (
    <RaghavOSDesktop
      profile={profile}
      projects={projects}
      research={research}
      databaseOnline={databaseOnline}
      wallpaperUrl={wallpaperUrl}
    />
  );
}
