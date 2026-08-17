import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminContentForm, type FieldConfig } from "@/components/admin/AdminContentForm";
import { updateJournalAction } from "../../actions";
import type { JournalEntry } from "@/types/database";

export default async function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("journal_entries").select("*").eq("id", id).maybeSingle<JournalEntry>();
  if (!data) notFound();

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", defaultValue: data.title },
    { name: "slug", label: "Slug", defaultValue: data.slug },
    { name: "summary", label: "Summary", type: "textarea", defaultValue: data.summary ?? undefined },
    { name: "body", label: "Body", type: "textarea", rows: 12, defaultValue: data.body ?? undefined },
    { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"], defaultValue: data.status },
    { name: "visibility", label: "Visibility", type: "select", options: ["private", "unlisted", "public"], defaultValue: data.visibility },
  ];

  const boundAction = updateJournalAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">Edit: {data.title}</h1>
      <AdminContentForm action={boundAction} fields={fields} />
    </div>
  );
}
