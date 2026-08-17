import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllContentForAdmin } from "@/lib/data/content";
import type { Project } from "@/types/database";
import { AdminContentList } from "@/components/admin/AdminContentList";
import { deleteProjectAction } from "./actions";

export default async function AdminProjectsListPage() {
  const supabase = createServerSupabaseClient();
  const items = await getAllContentForAdmin<Project>(supabase, "projects");

  return (
    <AdminContentList
      items={items.map((p) => ({ id: p.id, title: p.title, status: p.status, visibility: p.visibility }))}
      basePath="/admin/projects"
      deleteAction={deleteProjectAction}
      newLabel="New project"
    />
  );
}
