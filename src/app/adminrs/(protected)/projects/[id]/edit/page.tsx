import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { updateProjectAction } from "../../actions";
import type { Project } from "@/types/database";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle<Project>();
  if (!data) notFound();

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", defaultValue: data.title },
    { name: "slug", label: "Slug", defaultValue: data.slug },
    { name: "kind", label: "Kind", defaultValue: data.kind ?? undefined },
    { name: "summary", label: "Summary", type: "textarea", defaultValue: data.summary ?? undefined },
    { name: "body", label: "Body", type: "textarea", rows: 10, defaultValue: data.body ?? undefined },
    { name: "stack", label: "Stack", defaultValue: data.stack.join(", "), hint: "comma-separated" },
    { name: "repo_url", label: "Repository URL", type: "url", defaultValue: data.repo_url ?? undefined },
    { name: "live_url", label: "Live URL", type: "url", defaultValue: data.live_url ?? undefined },
    { name: "started_at", label: "Started", defaultValue: data.started_at ?? undefined },
    { name: "status", label: "Status", type: "select", options: ["idea", "active", "paused", "completed", "archived"], defaultValue: data.status },
    { name: "visibility", label: "Visibility", type: "select", options: ["private", "unlisted", "public"], defaultValue: data.visibility },
  ];

  const boundAction = updateProjectAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">Edit: {data.title}</h1>
      <AdminContentForm action={boundAction} fields={fields} />
    </div>
  );
}
