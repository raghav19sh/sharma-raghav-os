import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResearchForm } from "../../ResearchForm";
import { updateResearchAction } from "../../../actions/research";
import { getTagsFor } from "@/lib/data/tags";
import type { Research } from "@/types/database";

export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("research").select("*").eq("id", id).maybeSingle<Research>();
  if (!data) notFound();

  const tags = await getTagsFor(supabase, "research", data.id);
  const initialTags = tags.map((t) => t!.name).join(", ");

  const boundAction = updateResearchAction.bind(null, id);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold text-text-1">Edit: {data.title}</h1>
      <ResearchForm action={boundAction} initial={data} initialTags={initialTags} />
    </div>
  );
}
