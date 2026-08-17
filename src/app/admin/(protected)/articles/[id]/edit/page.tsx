import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { updateArticleAction } from "../../actions";
import type { Article } from "@/types/database";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle<Article>();
  if (!data) notFound();

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", defaultValue: data.title },
    { name: "slug", label: "Slug", defaultValue: data.slug },
    { name: "kind", label: "Kind", defaultValue: data.kind ?? undefined },
    { name: "summary", label: "Summary", type: "textarea", defaultValue: data.summary ?? undefined },
    { name: "body", label: "Body", type: "textarea", rows: 10, defaultValue: data.body ?? undefined },
    { name: "read_time_minutes", label: "Read time (minutes)", type: "number", defaultValue: data.read_time_minutes ?? undefined },
    { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"], defaultValue: data.status },
    { name: "visibility", label: "Visibility", type: "select", options: ["private", "unlisted", "public"], defaultValue: data.visibility },
  ];

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">Edit: {data.title}</h1>
      <AdminContentForm action={boundAction} fields={fields} />
    </div>
  );
}
