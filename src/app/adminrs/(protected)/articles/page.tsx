import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllContentForAdmin } from "@/lib/data/content";
import type { Article } from "@/types/database";
import { AdminContentList } from "@/components/admin/AdminContentList";
import { deleteArticleAction } from "./actions";

export default async function AdminArticlesListPage() {
  const supabase = await createServerSupabaseClient();
  const items = await getAllContentForAdmin<Article>(supabase, "articles");

  return (
    <AdminContentList
      items={items.map((a) => ({ id: a.id, title: a.title, status: a.status, visibility: a.visibility }))}
      basePath="/adminrs/articles"
      deleteAction={deleteArticleAction}
      newLabel="New article"
    />
  );
}
